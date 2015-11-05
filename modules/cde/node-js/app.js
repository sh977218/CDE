var cdesvc = require('./cdesvc')
    , boardsvc = require('./boardsvc')
    , usersvc = require('./usersvc')
    , mongo_data = require('./mongo-cde')
    , classificationNode = require('./classificationNode')
    , xml2js = require('xml2js')
    , vsac = require('./vsac-io')
    , config = require('../../system/node-js/parseConfig')
    , elastic = require('./elastic')
    , helper = require('../../system/node-js/helper.js')
    , logging = require('../../system/node-js/logging.js')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , path = require('path')
    , express = require('express')
    , sdc = require("./sdc.js")
    , status = require('./status')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , async = require("async")
    , multer = require('multer')
    , elastic_system = require('../../system/node-js/elastic')
    , exportShared = require('../../system/shared/exportShared')
    , js2xml = require('js2xmlparser')
    ;


exports.init = function (app, daoManager) {

    app.use("/cde/shared", express.static(path.join(__dirname, '../shared')));

    daoManager.registerDao(mongo_data);

    app.post('/boardSearch', function (req, res) {
        boardsvc.boardSearch(req, res);
    });

    app.post('/cdesByTinyIdList', function (req, res) {
        mongo_data.cdesByTinyIdList(req.body, function (err, cdes) {
            cdes.forEach(adminItemSvc.hideUnapprovedComments);
            res.send(cdes);
        });
    });

    app.get('/listOrgsFromDEClassification', exportShared.nocacheMiddleware, function (req, res) {
        elastic.DataElementDistinct("classification.stewardOrg.name", function (result) {
            res.send(result);
        });
    });

    app.get('/priorcdes/:id', exportShared.nocacheMiddleware, function (req, res) {
        cdesvc.priorCdes(req, res);
    });

    app.get('/forks/:id', exportShared.nocacheMiddleware, function (req, res) {
        cdesvc.forks(req, res);
    });

    app.post('/dataelement/fork', function (req, res) {
        adminItemSvc.fork(req, res, mongo_data);
    });

    app.post('/acceptFork', function (req, res) {
        adminItemSvc.acceptFork(req, res, mongo_data);
    });

    app.get('/forkroot/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.forkRoot(req, res, mongo_data);
    });

    app.get('/dataelement/:id', exportShared.nocacheMiddleware, function (req, res) {
        cdesvc.show(req, function (result) {
            if (!result) res.status(404).send();
            var cde = cdesvc.hideProprietaryPvs(result, req.user);
            adminItemSvc.hideUnapprovedComments(cde);
            res.send(cde);
        });
    });

    app.get('/deExists/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.exists({tinyId: req.params.tinyId, version: req.params.version}, function (err, result) {
            res.send(result);
        });
    });

    app.get('/debytinyid/:tinyId/:version?', exportShared.nocacheMiddleware, function (req, res) {
        function sendNativeJson(cde, res){
            res.send(cde);
        }

        function sendNativeXml(cde, res){
            res.setHeader("Content-Type", "application/xml");
            var exportCde = cde.toObject();
            delete exportCde._id;
            delete exportCde.history;
            delete exportCde.updatedBy.userId;
            res.send(js2xml("dataElement", exportCde));
        }

        var serveCde = function (err, cde) {
            if (!cde) return res.status(404).send();
            adminItemSvc.hideUnapprovedComments(cde);
            cde = cdesvc.hideProprietaryPvs(cde, req.user);
            if(!req.query.type) sendNativeJson(cde, res);
            else if (req.query.type==='json') sendNativeJson(cde, res);
            else if (req.query.type==='xml') sendNativeXml(cde, res);
            else return res.status(404).send("Cannot recognize export type.");

            if (req.isAuthenticated()) {
                mongo_data.addToViewHistory(cde, req.user);
            }
            mongo_data.incDeView(cde);
        };
        if (!req.params.version) {
            mongo_data.eltByTinyId(req.params.tinyId, serveCde);
        } else {
            mongo_data.byTinyIdAndVersion(req.params.tinyId, req.params.version, serveCde);
        }
    });

    app.post('/debytinyid/:tinyId/:version?', function (req, res) {
        return cdesvc.save(req, res);
    });

    app.post('/dataelement', function (req, res) {
        return cdesvc.save(req, res);
    });


    app.get('/viewingHistory/:start', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            var splicedArray = req.user.viewHistory.splice(req.params.start, 10);
            var idList = [];
            for (var i = 0; i < splicedArray.length; i++) {
                if (idList.indexOf(splicedArray[i]) === -1) idList.push(splicedArray[i]);
            }
            mongo_data.cdesByTinyIdListInOrder(idList, function (err, cdes) {
                res.send(cdesvc.hideProprietaryPvs(cdes, req.user));
            });
        }
    });

    app.get('/boards/:userId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.boardsByUserId(req.params.userId, function (result) {
            res.send(result);
        });
    });

    app.get('/deBoards/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.publicBoardsByDeTinyId(req.params.tinyId, function (result) {
            res.send(result);
        });
    });


    app.get('/board/:boardId/:start/:size?', exportShared.nocacheMiddleware, function (req, res) {
        var size = 20;
        if (req.params.size) {
            size = req.params.size;
        }
        if (size > 500) {
            return res.status(403).send("Request too large");
        }
        mongo_data.boardById(req.params.boardId, function (err, board) {
            if (board) {
                if (board.shareStatus !== "Public") {
                    if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                        return res.status(403).end();
                    }
                }
                var totalItems = board.pins.length;
                var pins = board.pins.splice(req.params.start, size);
                board.pins = pins;
                var idList = [];
                for (var i = 0; i < pins.length; i++) {
                    idList.push(pins[i].deTinyId);
                }
                mongo_data.cdesByTinyIdList(idList, function (err, cdes) {
                    res.send({board: board, cdes: cdesvc.hideProprietaryPvs(cdes), totalItems: totalItems});
                });
            } else {
                res.status(404).end();
            }
        });
    });

    app.post('/board', function (req, res) {
        var boardQuota = config.boardQuota || 50;
        var checkUnauthorizedPublishing = function (user, shareStatus) {
            return shareStatus === "Public" && !authorizationShared.hasRole(user, "BoardPublisher")
        };
        if (req.isAuthenticated()) {
            var board = req.body;
            if (!board._id) {
                board.createdDate = Date.now();
                board.owner = {
                    userId: req.user._id
                    , username: req.user.username
                };
                if (checkUnauthorizedPublishing(req.user, req.body.shareStatus)) {
                    return res.status(403).send("You don't have permission to make boards public!");
                }
                mongo_data.nbBoardsByUserId(req.user._id, function (err, nbBoards) {
                    if (nbBoards < boardQuota) {
                        mongo_data.newBoard(board, function (err, newBoard) {
                            if (err) res.status(500).send("An error occurred. ");
                            res.send();
                        });
                    } else {
                        res.status(403).send("You have too many boards!");
                    }
                });
            } else {
                mongo_data.boardById(board._id, function (err, b) {
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
                        res.send(b);
                    });
                });
            }
        } else {
            res.send("You must be logged in to do this.");
        }
    });

    app.delete('/board/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data.boardById(req.params.boardId, function (err, board) {
                if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                    res.send("You must own the board that you wish to delete.");
                }
                mongo_data.removeBoard(req.params.boardId, function () {
                    res.send("Board Removed.");
                });
            });
        } else {
            res.send("You must be logged in to do this.");
        }
    });

    // Check that apache will support delete
    app.delete('/pincde/:pinId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            usersvc.removePinFromBoard(req, res);
        } else {
            res.send("Please login first.");
        }
    });

    app.put('/pincde/:tinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            usersvc.pinToBoard(req, res);
        } else {
            res.send("Please login first.");
        }
    });

    app.get('/autocomplete/org/:name', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.org_autocomplete(req.params.name, function (result) {
            res.send(result);
        });
    });

    app.get('/cdediff/:deId', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.params.deId) res.status(404).send("Please specify CDE id.");
        mongo_data.byId(req.params.deId, function (err, dataElement) {
            if (err) return res.status(404).send("Cannot retrieve DataElement.");
            if (!dataElement.history || dataElement.history.length < 1) return res.send([]);
            mongo_data.byId(dataElement.history[dataElement.history.length - 1], function (err, priorDe) {
                var diff = cdesvc.diff(dataElement, priorDe);
                res.send(diff);
            });
        });
    });

    app.post('/elasticSearch/cde', function (req, res) {
        return elastic.elasticsearch(req.user, req.body, function (err, result) {
            if (err) return res.status(400).send("invalid query");
            result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
            res.send(result);
        });
    });

    app.post('/classification/cde/moveclassif', function (req, res) {
        classificationNode.moveClassifications(req, function (err, cde) {
            if (!err) res.send(cde);
        });
    });

    if (config.modules.cde.attachments) {
        app.post('/attachments/cde/add', multer(config.multer), function (req, res) {
            adminItemSvc.addAttachment(req, res, mongo_data);
        });

        app.post('/attachments/cde/remove', function (req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_data);
        });

        app.post('/attachments/cde/setDefault', function (req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_data);
        });
    }

    if (config.modules.cde.comments) {
        app.post('/comments/cde/add', function (req, res) {
            adminItemSvc.addComment(req, res, mongo_data);
        });

        app.post('/comments/cde/remove', function (req, res) {
            adminItemSvc.removeComment(req, res, mongo_data);
        });

        app.post('/comments/cde/approve', function (req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function (elt) {
                elt.comments[req.body.comment.index].pendingApproval = false;
                delete elt.comments[req.body.comment.index].pendingApproval;
            }, "Comment approved!");
        });

        app.post('/comments/cde/decline', function (req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function (elt) {
                elt.comments.splice(req.body.comment.index, 1);
            }, "Comment declined!");
        });
    }


    app.get('/userTotalSpace/:uname', function (req, res) {
        return mongo_data.userTotalSpace(req.params.uname, function (space) {
            return res.send({username: req.params.uname, totalSize: space});
        });
    });

    app.get('/moreLikeCde/:cdeId', exportShared.nocacheMiddleware, function (req, res) {
        elastic.morelike(req.params.cdeId, function (result) {
            result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get("/cde/derivationOutputs/:inputCdeTinyId", function(req, res) {
        mongo_data.derivationOutputs(req.params.inputCdeTinyId, function(err, cdes) {
            if (err) res.status(500).send();
            else {
                res.send(cdes);
            }
        });
    });

    app.post('/desByConcept', function (req, res) {
        mongo_data.desByConcept(req.body, function (result) {
            result.forEach(adminItemSvc.hideUnapprovedComments);
            res.send(cdesvc.hideProprietaryPvs(result, req.user));
        });
    });

    app.get('/deCount', function (req, res) {
        mongo_data.deCount(function (result) {
            res.send({count: result});
        });
    });

    var fetchRemoteData = function () {
        vsac.getTGT(function () {
            console.log("Got TGT");
        });

        elastic.fetchPVCodeSystemList();
    };

    // run every 1 hours
    fetchRemoteData();
    setInterval(fetchRemoteData, 1000 * 60 * 60);

    var parser = new xml2js.Parser();
    app.get('/vsacBridge/:vsacId', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.status(202).send({error: {message: "Please login to see VSAC mapping."}});
        }
        vsac.getValueSet(req.params.vsacId, function (result) {
            if (result === 404 || result === 400) {
                res.status(result);
                res.end();
            } else {
                parser.parseString(result, function (err, jsonResult) {
                    res.send(jsonResult);
                });
            }
        });
    });

    app.get('/permissibleValueCodeSystemList', exportShared.nocacheMiddleware, function (req, res) {
        res.send(elastic.pVCodeSystemList);
    });

    app.post('/retireCde', function (req, res) {
        req.params.type = "received";
        mongo_data.byId(req.body._id, function (err, cde) {
            if (err) res.status(404).send(err);
            if (!cde.registrationState.administrativeStatus === "Retire Candidate") return res.status(409).send("CDE is not a Retire Candidate");
            cde.registrationState.registrationStatus = "Retired";
            delete cde.registrationState.administrativeStatus;
            cde.save(function () {
                res.end();
            });
        });
    });

    var systemAlert = "";
    app.get("/systemAlert", exportShared.nocacheMiddleware, function (req, res) {
        res.send(systemAlert);
    });

    app.post("/systemAlert", function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            systemAlert = req.body.alert;
            res.send("OK");
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.get('/sdc/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        sdc.byTinyIdVersion(req, res);
    });

    app.get('/sdc/:id', exportShared.nocacheMiddleware, function (req, res) {
        sdc.byId(req, res);
    });

    app.get('/status/cde', status.status);

    app.post('/pinEntireSearchToBoard', function (req, res) {
        if (req.isAuthenticated()) {
            var query = elastic_system.buildElasticSearchQuery(req.user, req.body.query);
            if (query.size > config.maxPin) {
                res.status(403).send("Maximum number excesses.");
            } else {
                elastic_system.elasticsearch(query, 'cde', function (err, cdes) {
                    usersvc.pinAllToBoard(req, cdes.cdes, res);
                });
            }
        } else {
            res.send("Please login first.");
        }
    });

    app.get('/cde/properties/keys', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_data);
    });

    app.get('/cde/mappingSpecifications/types', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.getDistinct("mappingSpecifications.spec_type", function (err, types) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(types);
            }
        });
    });

    app.get('/cde/mappingSpecifications/contents', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.getDistinct("mappingSpecifications.content", function (err, contents) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(contents);
            }
        });
    });

    app.post('/getCdeAuditLog', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_data.getCdeAuditLog(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/elasticSearchExport/cde', function (req, res) {
        var exporter;
        if (req.query.type==='csv') {
            exporter = {
                transformObject: exportShared.convertToCsv
                , header: "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n"
                , delimiter: "\n"
                , footer: ""
                , type: 'text/csv'
            };
        }
        if (req.query.type==='json') {
            exporter = {
                transformObject: function(c){return JSON.stringify(c)}
                , header: "["
                , delimiter: ",\n"
                , footer: "]"
                , type: 'appplication/json'
            };
        }
        var query = elastic_system.buildElasticSearchQuery(req.user, req.body);
        return elastic_system.elasticSearchExport(res, query, 'cde', exporter);
    });

    app.get('/cdeCompletion/:term', exportShared.nocacheMiddleware, function (req, res) {
        var result = [];
        var term = req.params.term;
        elastic_system.completionSuggest(term, function (resp) {
            if (resp.search_suggest) {
                resp.search_suggest[0].options.map(function (item) {
                    result.push(item.text);
                });
            }
            res.send(result);
        })
    });

};
