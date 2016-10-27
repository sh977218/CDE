var cdesvc = require('./cdesvc')
    , usersvc = require('./usersvc')
    , mongo_cde = require('./mongo-cde')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , classificationNode = require('./classificationNode')
    , xml2js = require('xml2js')
    , vsac = require('./vsac-io')
    , config = require('../../system/node-js/parseConfig')
    , elastic = require('./elastic')
    , logging = require('../../system/node-js/logging.js')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , path = require('path')
    , express = require('express')
    , sdc = require("./sdc.js")
    , appStatus = require('./../../system/node-js/status')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , authorization = require("../../system/node-js/authorization")
    , multer = require('multer')
    , elastic_system = require('../../system/node-js/elastic')
    , exportShared = require('../../system/shared/exportShared')
    , js2xml = require('js2xmlparser')
    , usersrvc = require('../../system/node-js/usersrvc')

;

exports.init = function (app, daoManager) {
    app.use("/cde/shared", express.static(path.join(__dirname, '../shared')));

    daoManager.registerDao(mongo_cde);

    app.post('/boardSearch', exportShared.nocacheMiddleware, function (req, res) {
        elastic.boardSearch(req.body, function (err, result) {
            if (err) return res.status(500).send(err);
            return res.send(result);
        });
    });

    app.post('/myBoards', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            return res.status(403).send();
        } else {
            elastic.myBoards(req.user, req.body, function (err, result) {
                if (err) return res.status(500).send(err);
                return res.send(result);
            });
        }
    });

    app.post('/cdesByTinyIdList', function (req, res) {
        mongo_cde.cdesByTinyIdList(req.body, function (err, cdes) {
            res.send(cdes);
        });
    });

    app.get('/listOrgsFromDEClassification', exportShared.nocacheMiddleware, function (req, res) {
        elastic.DataElementDistinct("classification.stewardOrg.name", function (result) {
            res.send(result);
        });
    });

    app.get('/priorcdes/:id', exportShared.nocacheMiddleware, cdesvc.priorCdes);

    app.get('/cdeById/:id', exportShared.nocacheMiddleware, cdesvc.byId);

    app.get('/forks/:id', exportShared.nocacheMiddleware, cdesvc.forks);

    app.post('/dataelement/fork', function (req, res) {
        adminItemSvc.fork(req, res, mongo_cde);
    });

    app.post('/acceptFork', function (req, res) {
        adminItemSvc.acceptFork(req, res, mongo_cde);
    });

    app.get('/forkroot/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.forkRoot(req, res, mongo_cde);
    });

    app.get('/dataelement/:id', exportShared.nocacheMiddleware, function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        cdesvc.show(req, res, function (result) {
            if (!result) res.status(404).send();
            var cde = cdesvc.hideProprietaryCodes(result, req.user);
            res.send(cde);
        });
    });

    app.get('/deExists/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.exists({tinyId: req.params.tinyId, version: req.params.version}, function (err, result) {
            res.send(result);
        });
    });

    app.get('/debytinyid/:tinyId/:version?', exportShared.nocacheMiddleware, function (req, res) {
        function sendNativeJson(cde, res) {
            res.send(cde);
        }

        function sendNativeXml(cde, res) {
            res.setHeader("Content-Type", "application/xml");
            var exportCde = cde.toObject();
            exportCde = exportShared.stripBsonIds(exportCde);
            res.send(js2xml("dataElement", exportCde));
        }

        var serveCde = function (err, cde) {
            if (!cde) return res.status(404).send();
            cde = cdesvc.hideProprietaryCodes(cde, req.user);
            if (!req.query.type) sendNativeJson(cde, res);
            else if (req.query.type === 'json') sendNativeJson(cde, res);
            else if (req.query.type === 'xml') sendNativeXml(cde, res);
            else return res.status(404).send("Cannot recognize export type.");

            if (req.isAuthenticated()) {
                mongo_cde.addToViewHistory(cde, req.user);
            }
            mongo_cde.incDeView(cde);
        };
        if (!req.params.version) {
            mongo_cde.eltByTinyId(req.params.tinyId, serveCde);
        } else {
            mongo_cde.byTinyIdAndVersion(req.params.tinyId, req.params.version, serveCde);
        }
    });

    app.post('/debytinyid/:tinyId/:version?', cdesvc.save);

    app.post('/dataelement', cdesvc.save);

    app.get('/viewingHistory/:start', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            var splicedArray = req.user.viewHistory.splice(req.params.start, 10);
            var idList = [];
            for (var i = 0; i < splicedArray.length; i++) {
                if (idList.indexOf(splicedArray[i]) === -1) idList.push(splicedArray[i]);
            }
            mongo_cde.cdesByTinyIdListInOrder(idList, function (err, cdes) {
                res.send(cdesvc.hideProprietaryCodes(cdes, req.user));
            });
        }
    });

    app.get('/boards/:userId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.boardsByUserId(req.params.userId, function (result) {
            res.send(result);
        });
    });

    app.get('/deBoards/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.publicBoardsByDeTinyId(req.params.tinyId, function (result) {
            res.send(result);
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

        mongo_cde.boardById(req.params.boardId, function (err, board) {
            if (board) {
                if (board.shareStatus !== "Public") {
                    if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                        return res.status(403).end();
                    }
                }
                var totalItems = board.pins.length;
                board.pins = board.pins.splice(req.params.start, size).map(function(a) {
                    return a.toObject();
                });
                delete board._doc.owner.userId;
                var idList = board.pins.map(function(p) {
                    return p.deTinyId;
                });
                mongo_cde.cdesByTinyIdList(idList, function (err, cdes) {
                    if (req.query.type === "xml"){
                        res.setHeader("Content-Type", "application/xml");
                        var exportBoard ={
                            board: exportShared.stripBsonIds(board.toObject()),
                            cdes: cdesvc.hideProprietaryCodes(cdes.map(function(oneCde) {return exportShared.stripBsonIds(oneCde.toObject());}), req.user),
                            totalItems: totalItems
                        };
                        exportBoard = exportShared.stripBsonIds(exportBoard);

                        res.send(js2xml("export", exportBoard));

                    }
                    else {
                        res.send({board: board, cdes: cdesvc.hideProprietaryCodes(cdes, req.user), totalItems: totalItems});
                    }
                });
            } else {
                res.status(404).end();
            }


        });
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
                mongo_cde.nbBoardsByUserId(req.user._id, function (err, nbBoards) {
                    if (nbBoards < boardQuota) {
                        mongo_cde.newBoard(board, function (err) {
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
                mongo_cde.boardById(board._id, function (err, b) {
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

    function boardMove(req, res, moveFunc) {
        authorization.boardOwnership(req, res, req.body.boardId, function(board) {
            var index = 0;
            board.get('pins').forEach(function (p, i) {
                if (p.get('deTinyId') === req.body.tinyId) index = i;
            });
            if(index > -1) {
                moveFunc(board, index);
                board.save(function (err) {
                    if (err) res.status(500).send();
                    res.send();
                });
            } else {
                res.send();
            }
        });
    }

    app.post('/board/pin/move/up', function(req, res) {
        boardMove(req, res, function(board, index) {
            board.pins.splice(index - 1, 0, board.pins.splice(index, 1)[0]);
        });
    });
    app.post('/board/pin/move/down', function(req, res) {
        boardMove(req, res, function(board, index) {
            board.pins.splice(index + 1, 0, board.pins.splice(index, 1)[0]);
        });
    });
    app.post('/board/pin/move/top', function(req, res) {
        boardMove(req, res, function(board, index) {
            board.pins.splice(0, 0, board.pins.splice(index, 1)[0]);
        });
    });


    app.delete('/board/:boardId', function (req, res) {
        authorization.boardOwnership(req, res, req.params.boardId, function(board) {
            board.remove(function () {
                elastic.boardRefresh(function () {
                    res.send("Board Removed.");
                });
            });
        });
    });

    app.post('/classifyBoard', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode_system.classifyCdesInBoard(req, function (err) {
            if (!err) res.end();
            else res.status(500).send(err);
        });
    });

    app.delete('/pincde/:deTinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            usersvc.removePinFromBoard(req, res);
        } else {
            res.send("Please login first.");
        }
    });

    app.put('/pin/cde/:tinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            usersvc.pinCdeToBoard(req, res);
        } else {
            res.send("Please login first.");
        }
    });
    app.put('/pin/form/:tinyId/:boardId', function (req, res) {
        if (req.isAuthenticated()) {
            usersvc.pinFormToBoard(req, res);
        } else {
            res.send("Please login first.");
        }
    });

    app.get('/autocomplete/org/:name', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.org_autocomplete(req.params.name, function (result) {
            res.send(result);
        });
    });

    app.get('/cdediff/:deId', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.params.deId) res.status(404).send("Please specify CDE id.");
        mongo_cde.byId(req.params.deId, function (err, dataElement) {
            if (err) return res.status(404).send("Cannot retrieve DataElement.");
            if (!dataElement.history || dataElement.history.length < 1) return res.send([]);
            mongo_cde.byId(dataElement.history[dataElement.history.length - 1], function (err, priorDe) {
                var diff = cdesvc.diff(dataElement, priorDe);
                res.send(diff);
            });
        });
    });

    app.post('/elasticSearch/cde', function (req, res) {
        return elastic.elasticsearch(req.user, req.body, function (err, result) {
            if (err) return res.status(400).send("invalid query");
            result.cdes = cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/elasticSearch/count', function (req, res) {
        return elastic_system.nbOfCdes(function (err, result) {
            res.send("" + result);
        });
    });

    app.post('/classification/cde/moveclassif', function (req, res) {
        classificationNode.moveClassifications(req, function (err, cde) {
            if (!err) res.send(cde);
        });
    });

    if (config.modules.cde.attachments) {
        app.post('/attachments/cde/add', multer(config.multer), function (req, res) {
            adminItemSvc.addAttachment(req, res, mongo_cde);
        });

        app.post('/attachments/cde/remove', function (req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_cde);
        });

        app.post('/attachments/cde/setDefault', function (req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_cde);
        });
    }

    if (config.modules.cde.comments) {
        app.post('/comments/cde/add', function (req, res) {
            adminItemSvc.addComment(req, res, mongo_cde);
        });
        app.post('/comments/cde/remove', function (req, res) {
            adminItemSvc.removeComment(req, res, mongo_cde);
        });
    }


    app.get('/userTotalSpace/:uname', function (req, res) {
        return mongo_cde.userTotalSpace(req.params.uname, function (space) {
            return res.send({username: req.params.uname, totalSize: space});
        });
    });

    app.get('/moreLikeCde/:tinyId', exportShared.nocacheMiddleware, function (req, res) {
        elastic.morelike(req.params.tinyId, function (result) {
            result.cdes = cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get("/cde/derivationOutputs/:inputCdeTinyId", function (req, res) {
        mongo_cde.derivationOutputs(req.params.inputCdeTinyId, function (err, cdes) {
            if (err) res.status(500).send();
            else {
                res.send(cdes);
            }
        });
    });

    app.post('/desByConcept', function (req, res) {
        mongo_cde.desByConcept(req.body, function (result) {
            res.send(cdesvc.hideProprietaryCodes(result, req.user));
        });
    });

    app.get('/deCount', function (req, res) {
        mongo_cde.count({archived: null}, function (err, result) {
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
        } else {
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
        }
    });

    app.get('/umlsCuiFromSrc/:id/:src', function (req, res) {
        if (!config.umls.sourceOptions[req.params.src]) {
            return res.send("Source cannot be looked up, use UTS Instead.");
        }
        return vsac.umlsCuiFromSrc(req.params.id, req.params.src, res);
    });

    app.get('/umlsAtomsBridge/:id/:src', function (req, res) {
        if (!config.umls.sourceOptions[req.params.src]) {
            return res.send("Source cannot be looked up, use UTS Instead.");
        }
        if (config.umls.sourceOptions[req.params.src].requiresLogin && !req.user) {
            return res.status(403).send();
        }
        vsac.getAtomsFromUMLS(req.params.id, req.params.src, res);
    });

    app.get('/searchUmls', function (req, res) {
        if (!req.user) return res.status(403).send();
        return vsac.searchUmls(req.query.searchTerm, res);
    });

    app.get('/permissibleValueCodeSystemList', exportShared.nocacheMiddleware, function (req, res) {
        res.send(elastic.pVCodeSystemList);
    });

    app.post('/retireCde', function (req, res) {
        req.params.type = "received";
        mongo_cde.byId(req.body._id, function (err, cde) {
            if (err) res.status(404).send(err);
            // TODO JSHint: Thanks, looks like we wanted this rule but messed it up. Do we want the rule?
            //if (!cde.registrationState.administrativeStatus === "Retire Candidate")
            //    return res.status(409).send("CDE is not a Retire Candidate");
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

    app.get('/status/cde', appStatus.status);

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
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
    });

    app.get('/cde/mappingSpecifications/types', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.getDistinct("mappingSpecifications.spec_type", function (err, types) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(types);
            }
        });
    });

    app.get('/cde/mappingSpecifications/contents', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.getDistinct("mappingSpecifications.content", function (err, contents) {
            if (err) res.status(500).send("Unexpected Error");
            else {
                res.send(contents);
            }
        });
    });

    app.post('/getCdeAuditLog', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_cde.getCdeAuditLog(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/elasticSearchExport/cde', function (req, res) {
        var query = elastic_system.buildElasticSearchQuery(req.user, req.body);
        var exporters = {
            json: {
                export: function (res) {
                    var firstElt = true;
                    res.type('application/json');
                    res.write("[");
                    elastic_system.elasticSearchExport(function dataCb(err, elt) {
                        if (err) return res.status(500).send(err);
                        else if (elt) {
                            if (!firstElt) res.write(',');
                            elt = exportShared.stripBsonIds(elt);
                            elt = elastic_system.removeElasticFields(elt);
                            res.write(JSON.stringify(elt));
                            firstElt = false;
                        } else {
                            res.write("]");
                            res.send();
                        }
                    }, query, 'cde');
                }
            }
        };
        exporters.json.export(res);
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
        });
    });

    app.get('/api/cde/modifiedElements', function (req, res) {
        var dstring = req.query.from;

        function badDate() {
            res.status(300).send("Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24");
        }

        if (!dstring) badDate();
        if (dstring[4] !== '-' || dstring[7] !== '-') badDate();
        if (dstring.indexOf('20') !== 0) badDate();
        if (dstring[5] !== "0" && dstring[5] !== "1") badDate();
        if (dstring[8] !== "0" && dstring[8] !== "1" && dstring[8] !== "2" && dstring[8] !== "3") badDate();

        var date = new Date(dstring);
        mongo_cde.findModifiedElementsSince(date, function (err, elts) {
            res.send(elts);
        });
    });

    app.get('/esRecord/:id', function(req, res) {
        elastic.get(req.params.id, function (err, result) {
            if (err) throw err;
            else res.send(result);
        });
    });

};
