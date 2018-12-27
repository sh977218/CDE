const _ = require('lodash');
const js2xml = require('js2xmlparser');

const authorization = require('../system/authorization');
const loggedInMiddleware = authorization.loggedInMiddleware;
const nocacheMiddleware = authorization.nocacheMiddleware;

const stripBsonIds = require('esm')(module)('../../shared/system/exportShared').stripBsonIds;
const checkBoardOwnerShip = authorization.checkBoardOwnerShip;
const checkBoardViewerShip = authorization.checkBoardViewerShip;

const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const logError = dbLogger.logError;

const boardDb = require('./boardDb');
const userDb = require('../user/userDb');
const mongo_data = require('../system/mongo-data');
const elastic = require('./elastic');
const elastic_system = require('../system/elastic');
const config = require('../system/parseConfig');
const daoManager = require('../system/moduleDaoManager');
const cdeSvc = require('../cde/cdesvc');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    daoManager.registerDao(boardDb);

    router.put('/id/:id/dataElements/', [nocacheMiddleware, loggedInMiddleware], (req, res) => {
        let boardId = req.params.id;
        let cdes = req.body;
        if (!Array.isArray(cdes)) return res.status(400).send();
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).status("Not Authorized");
                let cdePins = cdes.forEach(c => {
                    c.pinnedDate = new Date();
                    c.type = 'form';
                });
                board.pins = _.uniqWith(board.pins.concat(cdePins), 'tinyId');
                board.save(handleError({req, res}, () => {
                    let message = "Added to Board";
                    if (cdes.length > 1) message = "All elements pinned.";
                    res.send(message);
                }));
            })
        );
    });

    router.put('/id/:id/forms/', [nocacheMiddleware, loggedInMiddleware], (req, res) => {
        let boardId = req.param.id;
        let forms = req.body;
        if (!Array.isArray(forms)) return res.status(400).send();
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).status("Not Authorized");
                let formPins = forms.forEach(f => {
                    f.pinnedDate = new Date();
                    f.type = 'form';
                });
                board.pins = _.uniqWith(board.pins.concat(formPins), 'tinyId');
                board.save(handleError({req, res}, () => {
                    let message = "Added to Board";
                    if (cdes.length > 1) message = "All elements pinned.";
                    res.send(message);
                }));
            })
        );
    });

    router.get('/byPinTinyId/:tinyId', [nocacheMiddleware], (req, res) => {
        boardDb.publicBoardsByPinTinyId(req.params.tinyId, handleError({req, res}, boards => res.send(boards)));
    });

    router.post('/deletePin/', [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        let tinyId = req.body.tinyId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to do this.");
                let index = board.pins.map(p => p.tinyId).indexOf(tinyId);
                if (index > -1) board.pins.splice(index, 1);
                board.save(handleError({req, res}, () => res.send("Removed")));
            })
        );
    });

    router.put('/pinToBoard/', [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        let type = req.body.type;
        let tinyIdList = req.body.tinyIdList;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).status("Not Authorized");
                let intersection = _.intersection(board.pins.map(p => p.tinyId), tinyIdList);
                if (!_.isEmpty(intersection)) return res.status(409).send("Already added");
                daoManager.getDao(type).byTinyIdList(tinyIdList, handleError({req, res}, elts => {
                    let newPins = elts.map(e => {
                        return {
                            pinnedDate: new Date(),
                            type: type,
                            name: e.designations[0].designation,
                            tinyId: e.tinyId
                        };
                    });
                    board.pins = _.uniqWith(board.pins.concat(newPins), 'tinyId');
                    board.save(handleError({req, res}, () => res.send()));
                }));
            })
        );

    });

    router.post('/pinMoveUp', (req, res) => {
        let boardId = req.body.boardId;
        let tinyId = req.body.tinyId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to delete it.");
                let match = board.get('pins').find(p => p.tinyId === tinyId);
                let index = match ? match.__index : -1;
                if (index !== -1) {
                    board.pins.splice(index - 1, 0, board.pins.splice(index, 1)[0]);
                    board.save(handleError({req, res}, () => res.send()));
                } else res.status(400).send("Nothing to move");
            })
        );
    });
    router.post('/pinMoveDown', (req, res) => {
        let boardId = req.body.boardId;
        let tinyId = req.body.tinyId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to delete it.");
                let match = board.get('pins').find(p => p.tinyId === tinyId);
                let index = match ? match.__index : -1;
                if (index !== -1) {
                    board.pins.splice(index + 1, 0, board.pins.splice(index, 1)[0]);
                    board.save(handleError({req, res}, () => res.send()));
                } else res.status(400).send("Nothing to move");
            })
        );
    });
    router.post('/pinMoveTop', (req, res) => {
        let boardId = req.body.boardId;
        let tinyId = req.body.tinyId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to delete it.");
                let match = board.get('pins').find(p => p.tinyId === tinyId);
                let index = match ? match.__index : -1;
                if (index !== -1) {
                    board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
                    board.save(handleError({req, res}, () => res.send()));
                } else res.status(400).send("Nothing to move");
            })
        );
    });

    router.delete('/:boardId', (req, res) => {
        let boardId = req.params.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to delete it.");
                board.remove(handleError({req, res}, () => {
                    elastic.boardRefresh(() => res.send("Board Removed."));
                }));
            })
        );
    });

    router.post('/boardSearch', [nocacheMiddleware], (req, res) => {
        elastic.boardSearch(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.get('/viewBoard/:boardId', [nocacheMiddleware], (req, res) => {
        let boardId = req.params.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (board.shareStatus === "Private") {
                    board.users.forEach(u => {
                        if (u.username.toLowerCase() === req.user.username.toLowerCase()) {
                            u.lastViewed = new Date();
                        }
                    });
                    board.save(handleError({req, res}, () => res.send()));
                }
            })
        );
    });

    router.get('/:boardId/:start/:size?/', [nocacheMiddleware], (req, res) => {
        let size = 20;
        if (req.params.size) size = Number.parseInt(req.params.size);
        if (size > 500) return res.status(403).send("Request too large");
        let boardId = req.params.boardId;
        let start = Number.parseInt(req.params.start);
        boardDb.byId(boardId, handle404({req, res}, b => {
            let board = b.toObject();
            if (board.shareStatus !== "Public" && !checkBoardViewerShip(board, req.user)) {
                return res.status(404).send();
            }
            delete board.owner.userId;
            let totalItems = board.pins.length;
            let tinyIdList = board.pins.splice(start, size).map(p => p.tinyId);
            board.pins = [];
            daoManager.getDao(board.type).elastic.byTinyIdList(tinyIdList, size, handleError({req, res}, elts => {
                if (board.type === 'cde') cdeSvc.hideProprietaryCodes(elts, req.user);
                let exportBoard = {
                    board: stripBsonIds(board),
                    elts: elts,
                    totalItems: totalItems
                };
                if (req.query.type === "xml") {
                    res.setHeader("Content-Type", "application/xml");
                    return res.send(js2xml("export", exportBoard));
                }
                res.send(exportBoard);
            }));
        }));
    });

    router.post('/', [loggedInMiddleware], (req, res) => {
        let boardQuota = config.boardQuota || 50;
        let board = req.body;
        if (!board._id) {
            board.createdDate = new Date();
            board.owner = {
                userId: req.user._id,
                username: req.user.username
            };
            if (authorization.unauthorizedPublishing(req.user, req.body)) {
                return res.status(403).send("You don't have permission to make boards public!");
            }
            boardDb.nbBoardsByUserId(req.user._id, function (err, nbBoards) {
                if (nbBoards < boardQuota) {
                    boardDb.newBoard(board, function (err) {
                        if (err) res.status(500).send("An error occurred. ");
                        elastic.boardRefresh(function () {
                            res.send();
                        });
                    });
                } else {
                    res.status(403).send("You have too many boards!");
                }
            });
        } else {
            boardDb.byId(board._id, handleError({req, res}, b => {
                if (!b) return res.status(404).send("No board found.");
                b.name = board.name;
                b.description = board.description;
                b.shareStatus = board.shareStatus;
                b.pins = board.pins;
                b.tags = board.tags;
                if (authorization.unauthorizedPublishing(req.user, b)) {
                    return res.status(403).send("You don't have permission to make boards public!");
                }
                b.save(handleError({req, res}, () => {
                    elastic.boardRefresh(() => res.send(b));
                }));
            }));
        }
    });

    router.post("/users", [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        let users = req.body.users;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(403).send();
                board.users = users;
                board.save(handleError({req, res}, () => res.send("done")));
            })
        );
    });
    router.post("/approval", [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        let approval = req.body.approval;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!board.review.startDate) return res.send('Board has not started review yet.');
                if (board.review.endDate && board.review.endDate < new Date()) return res.send('Board has already ended review.');
                board.users.forEach(u => {
                    if (u.username.toLowerCase() === req.user.username.toLowerCase()) {
                        u.status.approval = approval;
                        u.status.reviewedDate = new Date();
                    }
                });
                board.save(handleError({req, res}, () => res.send("done")));
            })
        );
    });

    router.post("/startReview", [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("Not Authorized.");
                board.review.startDate = new Date();
                board.review.endDate = undefined;
                board.users.forEach(function (u) {
                    u.status.approval = 'invited';
                });
                board.save(handleError({req, res}, () => res.send("done")));

                board.users.forEach(u => {
                    if (u.role === 'reviewer') {
                        userDb.userByUsername(u.username, function (err, u) {
                            if (u && u.username && u.username.length > 0) {
                                mongo_data.Message.findOneAndUpdate({
                                    'type': 'BoardApproval',
                                    'author.authorType': "user",
                                    'author.name': req.user.username,
                                    'recipient.recipientType': "user", 'recipient.name': u.username,
                                    'typeBoardApproval.element.eltType': 'board',
                                    'typeBoardApproval.element.name': board.name,
                                    'typeBoardApproval.element.eltId': board._id
                                }, {
                                    $set: {date: new Date()},
                                    $push: {
                                        "states": {
                                            $each: [
                                                {
                                                    "action": "Filed",
                                                    "date": new Date(),
                                                    "comment": "board"
                                                }],
                                            $position: 0
                                        }
                                    }
                                }, {upsert: true}, function (err) {
                                    if (err) {
                                        logError({
                                            message: "Unable to send inbox user",
                                            stack: err,
                                            details: "user: " + u.username + " in board: " + board._id
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            })
        );

    });
    router.post("/endReview", [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("Not Authorized.");
                board.review.endDate = new Date();
                board.save(handleError({req, res}, () => res.send("done")));
            })
        );
    });
    router.post("/remindReview", [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("Not Authorized.");
                res.send("done");
                board.users.forEach(u => {
                    if (u.role === 'reviewer' && u.status.approval === 'invited') {
                        userDb.userByUsername(u.username, handleError({req, res}, user => {
                            if (user) {
                                mongo_data.Message.findOneAndUpdate({
                                    'type': 'BoardApproval',
                                    'author.authorType': "user",
                                    'author.name': req.user.username,
                                    'recipient.recipientType': "user", 'recipient.name': user.username,
                                    'typeBoardApproval.element.eltType': 'board',
                                    'typeBoardApproval.element.name': board.name,
                                    'typeBoardApproval.element.eltId': board._id
                                }, {
                                    $set: {date: new Date()},
                                    $push: {
                                        "states": {
                                            $each: [
                                                {
                                                    "action": "Filed",
                                                    "date": new Date(),
                                                    "comment": "board"
                                                }],
                                            $position: 0
                                        }
                                    }
                                }, {upsert: true}, handleError({req, res}, () => res.send()));
                            }
                        }));
                    }
                });
            })
        );
    });

    router.post('/myBoards', [nocacheMiddleware, loggedInMiddleware], (req, res) => {
        elastic.myBoards(req.user, req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/pinEntireSearchToBoard', [loggedInMiddleware], (req, res) => {
        let boardId = req.body.boardId;
        boardDb.byId(boardId, handleError({req, res}, board => {
                if (!board) return res.status(404).send("No board found.");
                if (!checkBoardOwnerShip(board, req.user)) return res.status(401).send("You must own a board to do this.");
                let query = elastic_system.buildElasticSearchQuery(req.user, req.body.query);
                if (query.size > config.maxPin) return res.status(403).send("Maximum number excesses.");
                elastic_system.elasticsearch('cde', query, req.body.query, handleError({req, res}, result => {
                    let eltsPins = result.cdes.map(e => {
                        return {
                            pinnedDate: new Date(),
                            type: 'cde',
                            tinyId: e.tinyId,
                            name: e.designations[0].designation,
                        };
                    });
                    board.pins = _.uniqWith(board.pins.concat(eltsPins), 'tinyId');
                    board.save(handleError({req, res}, () => res.send("Added to Board")));
                }));
            })
        );
    });

    return router;


};