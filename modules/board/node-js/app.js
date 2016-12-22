var elastic = require('../../cde/node-js/elastic')
    , exportShared = require('../../system/shared/exportShared')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , mongo_cde = require('../../cde/node-js/mongo-cde')
    , mongo_form = require('../../form/node-js/mongo-form')
    , mongo_board = require('./mongo-board')
    , config = require('../../system/node-js/parseConfig')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , authorization = require("../../system/node-js/authorization")
    , logging = require('../../system/node-js/logging.js')
    , cdesvc = require('../../cde/node-js/cdesvc')
    , js2xml = require('js2xmlparser')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , usersrvc = require('../../system/node-js/usersrvc')
    , email = require('../../system/node-js/email')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , dbLogger = require('../../system/node-js/dbLogger.js')
    , boardsvc = require('./boardsvc')
    ;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_board);

    app.get('/boards/:userId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_board.boardsByUserId(req.params.userId, function (result) {
            res.send(result);
        });
    });

    app.get('/deBoards/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_board.publicBoardsByDeTinyId(req.params.tinyId, function (result) {
            res.send(result);
        });
    });

    app.delete('/pin/:dao/:tinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            boardsvc.removePinFromBoard(req, res, daoManager.getDao(req.params.dao));
        } else {
            res.send("Please login first.");
        }
    });

    app.put('/pin/:dao/:tinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            boardsvc.pinToBoard(req, res, daoManager.getDao(req.params.dao));
        } else {
            res.send("Please login first.");
        }
    });

    function boardMove(req, res, moveFunc) {
        authorization.boardOwnership(req, res, req.body.boardId, function (board) {
            var index = -1;
            board.get('pins').find(function (p, i) {
                    index = i;
                    return p.get('deTinyId') === req.body.tinyId;
                });
            if (index !== -1) {
                moveFunc(board, index);
                board.save(function (err) {
                    if (err) res.status(500).send();
                    else res.send();
                });
            } else {
                res.status(400).send("Nothing to move");
            }
        });
    }

    app.post('/board/pin/move/up', function (req, res) {
        boardMove(req, res, function (board, index) {
            board.pins.splice(index - 1, 0, board.pins.splice(index, 1)[0]);
        });
    });
    app.post('/board/pin/move/down', function (req, res) {
        boardMove(req, res, function (board, index) {
            board.pins.splice(index + 1, 0, board.pins.splice(index, 1)[0]);
        });
    });
    app.post('/board/pin/move/top', function (req, res) {
        boardMove(req, res, function (board, index) {
            board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
        });
    });


    app.delete('/board/:boardId', function (req, res) {
        authorization.boardOwnership(req, res, req.params.boardId, function (board) {
            board.remove(function (err) {
                if (err) res.status(500).send();
                else {
                    elastic.boardRefresh(function () {
                        res.send("Board Removed.");
                    });
                }
            });
        });
    });

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
                    if (!req.user || !req.user.username) return res.status(500).send();
                    var updateLastView = false;
                    var viewers = board.users.filter(function (u) {
                        if (u.username.toLowerCase() === req.user.username.toLowerCase()) {
                            u.lastViewed = new Date();
                            updateLastView = true;
                        }
                        return u.role === 'viewer' || u.role === 'reviewer';
                    }).map(function (u) {
                        return u.username.toLowerCase();
                    });
                    if (updateLastView) {
                        mongo_board.PinningBoard.findOneAndUpdate({
                            _id: board._id,
                            "users.username": req.user.username
                        }, {
                            $set: {
                                "users.$.lastViewed": new Date()
                            }
                        }, function (err) {
                            if (err) {
                                return res.status(500).send();
                            }
                        });
                    }
                    if (!req.isAuthenticated() ||
                        (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) && viewers.indexOf(req.user.username.toLowerCase()) === -1) {
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
                daoManager.getDao(board.type).elastic.byTinyIdList(idList, function (err, elts) {
                //daoManager.getDao(board.type).byTinyIdList(idList, function (err, elts) {
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
                        res.send({board, elts, totalItems});
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
                    if (err) return res.status(500).send();
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
    });
    app.post("/board/approval", function (req, res) {
        if (req.isAuthenticated()) {
            var approval = req.body.approval;
            mongo_board.boardById(req.body.boardId, function (err, board) {
                if (err) return res.send(500);
                else {
                    if (!board.review.startDate) return res.status(500).send('board has not started review yet.');
                    else if (board.review.endDate && board.review.endDate < new Date()) return res.status(500).send('board has already ended review.');
                    else {
                        if (board.users.find(function (u) {
                                if (u.username === req.user.username) {
                                    u.status.approval = approval;
                                    u.status.reviewedDate = new Date();
                                    return true;
                                }
                            })) {
                            mongo_board.PinningBoard.findOneAndUpdate({
                                _id: board._id,
                                "users.username": req.user.username
                            }, {
                                $set: {
                                    "users.$.status.approval": approval,
                                    "users.$.status.reviewedDate": new Date()
                                }
                            }, function (err) {
                                if (err) res.status(500);
                                return res.send();
                            });
                        } else return res.status(500).send('not authorized.');
                    }
                }
            })
        }
        else {
            res.send("You must be logged in to do this.");
        }
    });
    app.post("/board/startReview", function (req, res) {
        authorization.boardOwnership(req, res, req.body.boardId, function (board) {
            board.review.startDate = new Date();
            board.review.endDate = undefined;
            board.users.forEach(function (u) {
                u.status.approval = 'invited';
            });
            mongo_board.PinningBoard.findOneAndUpdate({_id: board._id}, {
                $set: {
                    "users": board.users,
                    "review.startDate": new Date(),
                    "review.endDate": undefined
                }
            }, function (err) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.send();
                    board.users.filter(function (u) {
                        return u.role === 'reviewer';
                    }).map(function (u) {
                        return u.username;
                    }).forEach(function (username) {
                        mongo_data_system.userByName(username, function (err, u) {
                            if (u && u.email && u.email.length > 0) {
                                email.emailUsers({
                                    subject: "You you been added to review board: " + board.name,
                                    body: "go to board to review and response."
                                }, [u], function (e) {
                                    if (e) {
                                        dbLogger.logError({
                                            message: "Unable to email user",
                                            stack: e,
                                            details: "user: " + u.username + " in board: " + board._id
                                        });
                                    }
                                });
                            }
                            if (u && u.username && u.username.length > 0) {
                                mongo_data_system.Message.findOneAndUpdate({
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
                                        dbLogger.logError({
                                            message: "Unable to send inbox user",
                                            stack: err,
                                            details: "user: " + u.username + " in board: " + board._id
                                        });
                                    }
                                })
                            }
                        });
                    });
                }
            });
        });
    });
    app.post("/board/endReview", function (req, res) {
        authorization.boardOwnership(req, res, req.body.boardId, function (board) {
            board.review.endDate = new Date();
            board.save(function (err) {
                if (err) res.status(500);
                return res.send();
            });
        });
    });
    app.post("/board/remindReview", function (req, res) {
        authorization.boardOwnership(req, res, req.body.boardId, function (board) {
            board.users.filter(function (u) {
                return u.role === 'reviewer' && u.status.approval === 'invited';
            }).map(function (u) {
                return u.username;
            }).forEach(function (username) {
                mongo_data_system.userByName(username, function (err, user) {
                    if (err) res.status.send(500);
                    if (user && user.email && user.email.length > 0) {
                        email.emailUsers({
                            subject: "You have a pending board to review: " + board.name,
                            body: "go to board to review and response."
                        }, [user], function (e) {
                            if (e) res.status(500).send();
                            mongo_data_system.Message.findOneAndUpdate({
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
                            }, {upsert: true}, function (err) {
                                if (err) res.status(500).send();
                                else res.send();
                            })
                        });
                    }
                });
            });
        });
    });

};