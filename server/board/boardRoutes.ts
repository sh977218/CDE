import { intersection, isEmpty, uniqBy } from 'lodash';
import { handleError } from 'server/errorHandler/errorHandler';
import { config } from 'server/system/parseConfig';
import { stripBsonIds } from 'shared/system/exportShared';
import {
    checkBoardViewerShip, loggedInMiddleware, nocacheMiddleware, unauthorizedPublishing
} from 'server/system/authorization';
import { validateBody } from 'server/system/bodyValidator';
import { hideProprietaryCodes } from 'server/cde/cdesvc';
import { buildElasticSearchQuery } from 'server/system/elastic';

const {check} = require('express-validator');

const js2xml = require('js2xmlparser');

const elastic_system = require('../system/elastic');
const daoManager = require('../system/moduleDaoManager');
const boardDb = require('./boardDb');
const elastic = require('./elastic');

require('express-async-errors');

export function module() {
    const router = require('express').Router();
    daoManager.registerDao(boardDb);

    router.get('/byPinTinyId/:tinyId', [nocacheMiddleware], async (req, res) => {
        let boards = await boardDb.publicBoardsByPinTinyId(req.params.tinyId);
        res.send(boards);
    });

    router.post('/deletePin/', [loggedInMiddleware], async (req, res) => {
        const {boardId, tinyId} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        let index = board.pins.map(p => p.tinyId).indexOf(tinyId);
        if (index > -1) {
            board.pins.splice(index, 1);
            await board.save();
            res.send('Removed');
        } else {
            res.send(422).send();
        }
    });

    router.put('/pinToBoard/', [loggedInMiddleware], async (req, res) => {
        const {boardId, type, tinyIdList} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();

        let intersectionCdes = intersection(board.pins.map(p => p.tinyId), tinyIdList);
        if (!isEmpty(intersectionCdes)) {
            return res.status(409).send('Already added');
        }
        daoManager.getDao(type).byTinyIdList(tinyIdList, handleError({req, res}, elts => {
            let newPins = elts.map(e => ({
                pinnedDate: new Date(),
                type,
                name: e.designations[0].designation,
                tinyId: e.tinyId
            }));
            board.pins = uniqBy(board.pins.concat(newPins), 'tinyId');
            board.save(handleError({req, res}, () => res.send()));
        }));
    });

    router.post('/pinMoveUp', [loggedInMiddleware], async (req, res) => {
        const {boardId, tinyId} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        let match = board.get('pins').find(p => p.tinyId === tinyId);
        let index = match ? match.__index : -1;
        if (index !== -1) {
            board.pins.splice(index - 1, 0, board.pins.splice(index, 1)[0]);
            await board.save();
            res.send();
        } else {
            res.status(422).send();
        }
    });

    router.post('/pinMoveDown', async (req, res) => {
        const {boardId, tinyId} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        let match = board.get('pins').find(p => p.tinyId === tinyId);
        let index = match ? match.__index : -1;
        if (index !== -1) {
            board.pins.splice(index + 1, 0, board.pins.splice(index, 1)[0]);
            await board.save();
            res.send()
        } else {
            res.status(422).send();
        }
    });
    router.post('/pinMoveTop', async (req, res) => {
        const {boardId, tinyId} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        let match = board.get('pins').find(p => p.tinyId === tinyId);
        let index = match ? match.__index : -1;
        if (index !== -1) {
            board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
            await board.save();
            res.send()
        } else {
            res.status(422).send('Nothing to move');
        }
    });

    router.delete('/:boardId', async (req, res) => {
        let boardId = req.params.boardId;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        await board.remove();
        await elastic.boardRefresh();
        res.send('Board Removed.')
    });

    router.post('/boardSearch', [nocacheMiddleware,
        check('selectedTypes').isArray(),
        check('selectedTags').isArray(),
        validateBody
    ], async (req, res) => {
        let result = await elastic.boardSearch(req.body);
        res.send(result)
    });

    router.get('/:boardId/:start/:size?/', [nocacheMiddleware], async (req, res) => {
        let size = 20;
        if (req.params.size) size = Number.parseInt(req.params.size);
        if (size > 500) return res.status(400).send('Request too large');
        let boardId = req.params.boardId;
        let start = Number.parseInt(req.params.start);
        let board = await boardDb.byId(boardId);
        let boardObj = board.toObject();
        if (boardObj.shareStatus !== 'Public' && !checkBoardViewerShip(boardObj, req.user)) {
            return res.status(404).send();
        }
        delete boardObj.owner.userId;
        let totalItems = boardObj.pins.length;
        let tinyIdList = boardObj.pins.splice(start, size).map(p => p.tinyId);
        boardObj.pins = [];
        daoManager.getDao(boardObj.type).elastic.byTinyIdList(tinyIdList, size, handleError({req, res}, elts => {
            if (boardObj.type === 'cde') hideProprietaryCodes(elts, req.user);
            let exportBoard = {
                board: stripBsonIds(boardObj),
                elts: elts,
                totalItems: totalItems
            };
            if (req.query.type === 'xml') {
                res.setHeader('Content-Type', 'application/xml');
                return res.send(js2xml('export', exportBoard));
            }
            res.send(exportBoard);
        }));
    });

    router.post('/', [loggedInMiddleware], async (req, res) => {
        let boardQuota = config.boardQuota || 50;
        let board = req.body;
        if (!board._id) {
            board.createdDate = new Date();
            board.owner = {
                userId: req.user._id,
                username: req.user.username
            };
            board.pins.forEach(p => p.pinnedDate = new Date());
            if (unauthorizedPublishing(req.user, req.body)) {
                return res.status(403).send('You don\'t have permission to make boards public!');
            }
            let nbBoards = await boardDb.nbBoardsByUserId(req.user._id);
            if (nbBoards <= boardQuota) {
                res.status(403).send('You have too many boards!');
            } else {
                await boardDb.newBoard(board);
                await elastic.boardRefresh();
                res.send();
            }
        } else {
            let b = await boardDb.byId(board._id);
            b.name = board.name;
            b.description = board.description;
            b.shareStatus = board.shareStatus;
            b.pins = board.pins;
            b.tags = board.tags;
            if (unauthorizedPublishing(req.user, b)) {
                return res.status(403).send("You don't have permission to make boards public!");
            }
            await b.save();
            await elastic.boardRefresh();
            res.send(b);
        }
    });

    router.post('/users', [loggedInMiddleware], async (req, res) => {
        const {boardId, users} = req.body;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        board.users = users;
        await board.save();
        res.send('done');
    });

    router.post('/myBoards', [nocacheMiddleware, loggedInMiddleware,
        check('sortDirection').isIn(['', 'desc', 'asc']), validateBody], async (req, res) => {
        let result = await elastic.myBoards(req.user, req.body);
        res.send(result);
    });

    router.post('/pinEntireSearchToBoard', [loggedInMiddleware], async (req, res) => {
        const boardId = req.body.boardId;
        let board = await boardDb.byIdAndOwner(boardId, req.user._id);
        if (!board) return res.status(404).send();
        let query = buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > config.maxPin) {
            return res.status(403).send('Maximum number excesses.');
        }
        elastic_system.elasticsearch('cde', query, req.body.query, handleError({req, res}, result => {
            let eltsPins = result.cdes.map(e => ({
                pinnedDate: new Date(),
                type: 'cde',
                tinyId: e.tinyId,
                name: e.designations[0].designation,
            }));
            board.pins = uniqBy(board.pins.concat(eltsPins), 'tinyId');
            board.save(handleError({req, res}, () => res.send('Added to Board')));
        }));
    });

    return router;
}
