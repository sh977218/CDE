var elastic = require('../../cde/node-js/elastic')
    , exportShared = require('../../system/shared/exportShared')
    , mongo_cde = require('../../cde/node-js/mongo-cde')
    , mongo_form = require('../../form/node-js/mongo-form')
    , mongo_board = require('./mongo-board')
    , config = require('../../system/node-js/parseConfig')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , logging = require('../../system/node-js/logging.js')
    , cdesvc = require('../../cde/node-js/cdesvc')
    , js2xml = require('js2xmlparser')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , usersrvc = require('../../system/node-js/usersrvc')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    ;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_board);


    app.post('/classifyCdeBoard', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName)) {
            return res.status(401).send();
        }
        classificationNode_system.classifyEltsInBoard(req, mongo_cde, function (err) {
            if (err) res.status(500).send(err);
            else res.send();
        });
    });
    app.post('/classifyFormBoard', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName)) {
            return res.status(401).send();
        }
        classificationNode_system.classifyEltsInBoard(req, mongo_form, function (err) {
            if (err) res.status(500).send(err);
            else res.send();
        });
    });

    app.post('/boardSearch', exportShared.nocacheMiddleware, function (req, res) {
        elastic.boardSearch(req.body, function (err, result) {
            if (err) return res.status(500).send(err);
            return res.send(result);
        });
    });

    app.get('/board/:boardId/:start/:size?/', exportShared.nocacheMiddleware, function (req, res) {
        var size = 20;
        if (req.params.size) {
            size = req.params.size;
        }
        if (size > 500) {
            return res.status(403).send("Request too large");
        }

        mongo_board.boardById(req.params.boardId, function (err, board) {
            if (board) {
                if (board.shareStatus !== "Public") {
                    if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                        return res.status(403).end();
                    }
                }
                var totalItems = board.pins.length;
                board.pins = board.pins.splice(req.params.start, size).map(function (a) {
                    return a.toObject();
                });
                delete board._doc.owner.userId;
                var idList = board.pins.map(function (p) {
                    return board.type === 'cde' ? p.deTinyId : p.formTinyId;
                });
                daoManager.getDao(board.type).byTinyIdList(idList, function (err, elts) {
                    if (req.query.type === "xml") {
                        res.setHeader("Content-Type", "application/xml");
                        elts = elts.map(function (oneCde) {
                            return exportShared.stripBsonIds(oneCde.toObject());
                        });
                        if (board.type === 'cde') {
                            elts = cdesvc.hideProprietaryCodes(elts, req.user);
                        }
                        var exportBoard = {
                            board: exportShared.stripBsonIds(board.toObject()),
                            elts: elts,
                            totalItems: totalItems
                        };
                        exportBoard = exportShared.stripBsonIds(exportBoard);

                        res.send(js2xml("export", exportBoard));

                    }
                    else {
                        elts = cdesvc.hideProprietaryCodes(elts, req.user);
                        res.send({board: board, elts: elts, totalItems: totalItems});
                    }
                });
            } else {
                res.status(404).send();
            }
        });
    });

    app.post('/comments/board/add', function (req, res) {
        adminItemSvc.addComment(req, res, mongo_board);
    });
    app.post('/comments/board/remove', function (req, res) {
        adminItemSvc.removeComment(req, res, mongo_board);
    });

    app.post('/board', function (req, res) {
        var boardQuota = config.boardQuota || 50;
        var checkUnauthorizedPublishing = function (user, shareStatus) {
            return shareStatus === "Public" && !authorizationShared.hasRole(user, "BoardPublisher");
        };
        if (req.isAuthenticated()) {
            var board = req.body;
            if (!board._id) {
                board.createdDate = Date.now();
                board.owner = {
                    userId: req.user._id,
                    username: req.user.username
                };
                if (checkUnauthorizedPublishing(req.user, req.body.shareStatus)) {
                    return res.status(403).send("You don't have permission to make boards public!");
                }
                mongo_board.nbBoardsByUserId(req.user._id, function (err, nbBoards) {
                    if (nbBoards < boardQuota) {
                        mongo_board.newBoard(board, function (err) {
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
                mongo_board.boardById(board._id, function (err, b) {
                    if (err) {
                        logging.errorLogger.error("Cannot find board by id", {
                            origin: "cde.app.board",
                            stack: new Error().stack,
                            request: logging.generateErrorLogRequest(req),
                            details: "board._id " + board._id
                        });
                        return res.status(404).send("Cannot find board.");
                    }
                    b.name = board.name;
                    b.description = board.description;
                    b.shareStatus = board.shareStatus;
                    b.pins = board.pins;
                    b.tags = board.tags;

                    if (checkUnauthorizedPublishing(req.user, b.shareStatus)) {
                        return res.status(403).send("You don't have permission to make boards public!");
                    }
                    b.save(function (err) {
                        if (err) {
                            logging.errorLogger.error("Cannot save board", {
                                origin: "cde.app.board",
                                stack: new Error().stack,
                                request: logging.generateErrorLogRequest(req),
                                details: "board._id " + board._id
                            });
                        }
                        elastic.boardRefresh(function () {
                            res.send(b);
                        });
                    });
                });
            }
        } else {
            res.send("You must be logged in to do this.");
        }
    });

    app.post("/board/users", function (req, res) {
        if (req.isAuthenticated()) {
            var boardId = req.body.boardId;
            var users = req.body.users;
            var user = req.body.user;
            var owner = req.body.owner;
            if (owner.username !== user.username) {
                return res.send("You do not have permission.");
            } else {
                mongo_board.boardById(boardId, function (err, board) {
                    if (err) return res.send(500);
                    else {
                        board.users = users;
                        board.markModified("users");
                        board.save(function (e) {
                            if (e) {
                                return res.send(500);
                            }
                            else {
                                return res.send("done");
                            }
                        })
                    }
                })
            }
        }
        else {
            res.send("You must be logged in to do this.");
        }
    })
    
    
};