import { Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { intersection, isEmpty, uniqBy } from 'lodash';
import { config, dbPlugins } from 'server';
import { boardRefresh, myBoards } from 'server/board/elastic';
import { hideProprietaryCodes } from 'server/cde/cdesvc';
import { moduleItemToDbName } from 'server/dbPlugins';
import { respondError } from 'server/errorHandler';
import { checkBoardViewerShip, loggedInMiddleware, nocacheMiddleware, unauthorizedPublishing } from 'server/system/authorization';
import { validateBody } from 'server/system/bodyValidator';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';
import { elasticsearchPromise } from 'server/system/elastic';
import { MAX_PINS } from 'shared/constants';
import { Board, BoardPin, Elt, ModuleItem } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { stripBsonIds } from 'shared/exportShared';

const js2xml = require('js2xmlparser');
require('express-async-errors');

export function module() {
    const router = Router();

    router.post('/deletePin/', loggedInMiddleware, async (req, res): Promise<Response> => {
        try {
            const {boardId, tinyId} = req.body;
            const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
            if (!board) {
                return res.status(404).send();
            }
            const index = board.pins.map(p => p.tinyId).indexOf(tinyId);
            if (index === -1) {
                return res.status(422).send();
            }
            board.pins.splice(index, 1);
            await dbPlugins.board.save(board);
            return res.send('Removed');
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.put('/pinToBoard/', loggedInMiddleware, (req, res): Promise<Response> => {
        const {boardId, tinyIdList, type}: { boardId: string, tinyIdList: string[], type: ModuleItem } = req.body;
        return dbPlugins.board.byIdAndOwner(boardId, req.user._id)
            .then(board => {
                if (!board) {
                    return res.status(404).send();
                }
                const intersectionCdes = intersection(board.pins.map(p => p.tinyId), tinyIdList);
                if (!isEmpty(intersectionCdes)) {
                    return res.status(409).send('Already added');
                }
                return dbPlugins[moduleItemToDbName(type)].byTinyIdListElastic(tinyIdList)
                    .then(elts => {
                        board.pins = uniqBy(board.pins.concat(elts.map(mapToBoardPin)), 'tinyId');
                        return dbPlugins.board.save(board)
                            .then(() => res.send());
                    });
            })
            .catch(respondError({req, res}))
    });

    const pinMoveByIncrement = (inc: number) => async (req: Request, res: Response): Promise<Response> => {
        try {
            const {boardId, tinyId} = req.body;
            const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
            if (!board) {
                return res.status(404).send();
            }
            const index = board.pins.findIndex((p: BoardPin) => p.tinyId === tinyId);
            if (index === -1) {
                return res.status(422).send();
            }
            board.pins.splice(index + inc, 0, board.pins.splice(index, 1)[0]);
            await dbPlugins.board.save(board);
            return res.send();
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    };

    router.post('/pinMoveUp', loggedInMiddleware, pinMoveByIncrement(-1));

    router.post('/pinMoveDown', loggedInMiddleware, pinMoveByIncrement(1));

    router.post('/pinMoveTop', async (req, res): Promise<Response> => {
        try {
            const {boardId, tinyId} = req.body;
            const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
            if (!board) {
                return res.status(404).send();
            }
            const index = board.pins.findIndex((p: BoardPin) => p.tinyId === tinyId);
            if (index === -1) {
                return res.status(422).send('Nothing to move');
            }
            board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
            await dbPlugins.board.save(board);
            return res.send();
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.delete('/:boardId', async (req, res): Promise<Response> => {
        try {
            const boardId = req.params.boardId;
            const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
            if (!board) {
                return res.status(404).send();
            }
            await dbPlugins.board.deleteOneById(board._id);
            await boardRefresh();
            return res.send('Board Removed.');
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.get('/:boardId/:start/:size?/', nocacheMiddleware, async (req, res): Promise<Response> => {
        try {
            let size = 20;
            if (req.params.size) {
                size = parseInt(req.params.size, 10);
            }
            if (size > 500) {
                return res.status(400).send('Request too large');
            }
            const boardId = req.params.boardId;
            const start = parseInt(req.params.start, 10);
            const board = await dbPlugins.board.byId(boardId);
            if (!board || board.shareStatus !== 'Public' && !checkBoardViewerShip(board, req.user)) {
                return res.status(404).send();
            }
            delete board.owner.userId;
            const totalItems = board.pins.length;
            const tinyIdList = board.pins.splice(start, size).map(p => p.tinyId);
            board.pins = [];
            return await dbPlugins[moduleItemToDbName(board.type)].cache.byTinyIdList(tinyIdList, size)
                .then(elts => {
                    if (board.type === 'cde') {
                        hideProprietaryCodes(elts as DataElement[], req.user);
                    }
                    const exportBoard = {
                        board: stripBsonIds(board),
                        elts,
                        totalItems
                    };
                    if (req.query.type === 'xml') {
                        res.setHeader('Content-Type', 'application/xml');
                        return res.send(js2xml('export', exportBoard));
                    }
                    return res.send(exportBoard);
                });
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.post('/', loggedInMiddleware, async (req, res): Promise<Response> => {
        try {
            const boardQuota = config.boardQuota || 50;
            const board: Board = req.body;
            const boardDocument = board._id ? await dbPlugins.board.byId(board._id) : undefined;
            if (!boardDocument) {
                board.createdDate = new Date();
                board.owner = {
                    userId: req.user._id,
                    username: req.user.username
                };
                board.pins.forEach(p => p.pinnedDate = new Date());
                if (unauthorizedPublishing(req.user, req.body)) {
                    return res.status(403).send('You don\'t have permission to make boards public!');
                }
                const numberBoards = await dbPlugins.board.countByUser(req.user._id);
                if (numberBoards >= boardQuota) {
                    return res.status(403).send('You have too many boards!');
                }
                return res.send(await dbPlugins.board.save(board));
            } else {
                boardDocument.name = board.name;
                boardDocument.description = board.description;
                boardDocument.shareStatus = board.shareStatus;
                boardDocument.pins = board.pins;
                boardDocument.tags = board.tags;
                if (unauthorizedPublishing(req.user, boardDocument)) {
                    return res.status(403).send("You don't have permission to make boards public!");
                }
                return res.send(await dbPlugins.board.save(boardDocument));
            }
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.post('/users', loggedInMiddleware, async (req, res): Promise<Response> => {
        try {
            const {boardId, users} = req.body;
            const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
            if (!board) {
                return res.status(404).send();
            }
            board.users = users;
            await dbPlugins.board.save(board);
            return res.send('done');
        }
        catch (err) {
            return respondError({req, res})(err);
        }
    });

    router.post('/myBoards', nocacheMiddleware, loggedInMiddleware,
        check('sortDirection').isIn(['', 'desc', 'asc']), validateBody,
        async (req, res): Promise<Response> => {
            const result = await myBoards(req.user, req.body);
            return res.send(result.body);
        }
    );

    router.post('/pinEntireSearchToBoard', loggedInMiddleware, async (req, res): Promise<Response> => {
        const boardId = req.body.boardId;
        const board = await dbPlugins.board.byIdAndOwner(boardId, req.user._id);
        if (!board) {
            return res.status(404).send();
        }
        const query = buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > MAX_PINS) {
            return res.status(403).send('Maximum number excesses.');
        }
        return elasticsearchPromise('cde', query, req.body.query)
            .then(result => {
                board.pins = uniqBy(board.pins.concat(result.cdes.map(mapToBoardPin)), 'tinyId');
                return dbPlugins.board.save(board)
                    .then(() => res.send('Added to Board'));
            })
            .catch(respondError({req, res}));
    });

    return router;
}

function mapToBoardPin(elt: Elt, index: number, array: Elt[]): BoardPin {
    return {
        name: elt.designations[0].designation,
        pinnedDate: new Date(),
        tinyId: elt.tinyId,
        type: elt.elementType,
    };
}
