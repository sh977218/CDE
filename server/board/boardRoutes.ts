import { Request, Response, Router } from 'express';
import { intersection, isEmpty, uniqBy } from 'lodash';
import * as boardDb from 'server/board/boardDb';
import { byId, byIdAndOwner, nbBoardsByUserId, newBoard } from 'server/board/boardDb';
import { boardRefresh, boardSearch, myBoards } from 'server/board/elastic';
import { hideProprietaryCodes } from 'server/cde/cdesvc';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { checkBoardViewerShip, loggedInMiddleware, nocacheMiddleware, unauthorizedPublishing } from 'server/system/authorization';
import { validateBody } from 'server/system/bodyValidator';
import { elasticsearch } from 'server/system/elastic';
import { getDao, registerDao } from 'server/system/moduleDaoManager';
import { ItemDocument } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { Board, BoardPin, ItemElastic, ModuleAll } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { stripBsonIds } from 'shared/system/exportShared';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';

const js2xml = require('js2xmlparser');
const {check} = require('express-validator');
require('express-async-errors');

export function module() {
    const router = Router();
    registerDao(boardDb);

    router.post('/deletePin/', loggedInMiddleware, async (req, res) => {
        const {boardId, tinyId} = req.body;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        const index = board.pins.map(p => p.tinyId).indexOf(tinyId);
        if (index > -1) {
            board.pins.splice(index, 1);
            await (board.save as any)();
            res.send('Removed');
        } else {
            res.status(422).send();
        }
    });

    router.put('/pinToBoard/', loggedInMiddleware, async (req, res) => {
        const {boardId, tinyIdList, type}: { boardId: string, tinyIdList: string[], type: ModuleAll } = req.body;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }

        const intersectionCdes = intersection(board.pins.map(p => p.tinyId), tinyIdList);
        if (!isEmpty(intersectionCdes)) {
            return res.status(409).send('Already added');
        }
        getDao(type).byTinyIdListElastic(tinyIdList, handleNotFound<ItemDocument[]>({req, res}, elts => {
            const newPins: any[] = elts.map(e => ({
                pinnedDate: new Date(),
                type,
                name: e.designations[0].designation,
                tinyId: e.tinyId
            }));
            board.pins = uniqBy(board.pins.concat(newPins), 'tinyId');
            (board.save as any)(handleError({req, res}, () => res.send()));
        }));
    });

    const pinMoveByIncrement = (inc: number) => async (req: Request, res: Response) => {
        const {boardId, tinyId} = req.body;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            res.status(404).send();
            return;
        }
        const match = board.get('pins').find((p: BoardPin) => p.tinyId === tinyId);
        const index = match ? match.__index : -1;
        if (index === -1) {
            res.status(422).send();
            return;
        }
        board.pins.splice(index + inc, 0, board.pins.splice(index, 1)[0]);
        await (board.save as any)();
        res.send();
    };

    router.post('/pinMoveUp', loggedInMiddleware, pinMoveByIncrement(-1));

    router.post('/pinMoveDown', loggedInMiddleware, pinMoveByIncrement(1));

    router.post('/pinMoveTop', async (req, res) => {
        const {boardId, tinyId} = req.body;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        const match = board.get('pins').find((p: BoardPin) => p.tinyId === tinyId);
        const index = match ? match.__index : -1;
        if (index !== -1) {
            board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
            await (board.save as any)();
            res.send();
        } else {
            res.status(422).send('Nothing to move');
        }
    });

    router.delete('/:boardId', async (req, res) => {
        const boardId = req.params.boardId;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        await (board as any).remove();
        await boardRefresh();
        res.send('Board Removed.');
    });

    router.post('/boardSearch', nocacheMiddleware,
        check('selectedTypes').isArray(),
        check('selectedTags').isArray(),
        validateBody,
        async (req, res) => {
            const result = await boardSearch(req.body);
            res.send(result.body);
        }
    );

    router.get('/:boardId/:start/:size?/', nocacheMiddleware, async (req, res) => {
        let size = 20;
        if (req.params.size) {
            size = parseInt(req.params.size, 10);
        }
        if (size > 500) {
            return res.status(400).send('Request too large');
        }
        const boardId = req.params.boardId;
        const start = parseInt(req.params.start, 10);
        const board = await byId(boardId);
        if (!board) {
            return res.status(404).send();
        }
        const boardObj: Board = board.toObject();
        if (boardObj.shareStatus !== 'Public' && !checkBoardViewerShip(boardObj, req.user)) {
            return res.status(404).send();
        }
        delete boardObj.owner.userId;
        const totalItems = boardObj.pins.length;
        const tinyIdList = boardObj.pins.splice(start, size).map(p => p.tinyId);
        boardObj.pins = [];
        getDao(boardObj.type).elastic.byTinyIdList(tinyIdList, size, handleNotFound({
            req,
            res
        }, (elts: ItemElastic[]) => {
            if (boardObj.type === 'cde') {
                hideProprietaryCodes(elts as DataElement[], req.user);
            }
            const exportBoard = {
                board: stripBsonIds(boardObj),
                elts,
                totalItems
            };
            if (req.query.type === 'xml') {
                res.setHeader('Content-Type', 'application/xml');
                return res.send(js2xml('export', exportBoard));
            }
            res.send(exportBoard);
        }));
    });

    router.post('/', loggedInMiddleware, async (req, res) => {
        const boardQuota = config.boardQuota || 50;
        const board: Board = req.body;
        const boardDocument = board._id ? await byId(board._id) : undefined;
        if (!board._id || !boardDocument) {
            board.createdDate = new Date();
            board.owner = {
                userId: req.user._id,
                username: req.user.username
            };
            board.pins.forEach(p => p.pinnedDate = new Date());
            if (unauthorizedPublishing(req.user, req.body)) {
                return res.status(403).send('You don\'t have permission to make boards public!');
            }
            const nbBoards = await nbBoardsByUserId(req.user._id);
            if (nbBoards >= boardQuota) {
                res.status(403).send('You have too many boards!');
            } else {
                await newBoard(board);
                await boardRefresh();
                res.send();
            }
        } else {
            boardDocument.name = board.name;
            boardDocument.description = board.description;
            boardDocument.shareStatus = board.shareStatus;
            boardDocument.pins = board.pins;
            boardDocument.tags = board.tags;
            if (unauthorizedPublishing(req.user, boardDocument)) {
                return res.status(403).send("You don't have permission to make boards public!");
            }
            await (boardDocument.save as any)();
            await boardRefresh();
            res.send(boardDocument);
        }
    });

    router.post('/users', loggedInMiddleware, async (req, res) => {
        const {boardId, users} = req.body;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        board.users = users;
        await (board.save as any)();
        res.send('done');
    });

    router.post('/myBoards', nocacheMiddleware, loggedInMiddleware,
        check('sortDirection').isIn(['', 'desc', 'asc']), validateBody, async (req, res) => {
            const result = await myBoards(req.user, req.body);
            res.send(result.body);
        });

    router.post('/pinEntireSearchToBoard', loggedInMiddleware, async (req, res) => {
        const boardId = req.body.boardId;
        const board = await byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        const query = buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > config.maxPin) {
            return res.status(403).send('Maximum number excesses.');
        }
        elasticsearch('cde', query, req.body.query, handleNotFound({req, res}, result => {
            const eltsPins: any[] = result.cdes.map(e => ({
                pinnedDate: new Date(),
                type: 'cde',
                tinyId: e.tinyId,
                name: e.designations[0].designation,
            }));
            board.pins = uniqBy(board.pins.concat(eltsPins), 'tinyId');
            (board.save as any)(handleError({req, res}, () => res.send('Added to Board')));
        }));
    });

    return router;
}
