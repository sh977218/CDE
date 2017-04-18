var cdesvc = require('./cdesvc')
    , cdediff = require('./cdediff')
    , boardsvc = require('./../../board/node-js/boardsvc')
    , mongo_cde = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , classificationNode = require('./classificationNode')
    , classificationShared = require('../../system/shared/classificationShared')
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
        mongo_cde.byTinyIdList(req.body, function (err, cdes) {
            if (err) res.status(500).send();
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

    app.get('/deExists/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        mongo_cde.exists({tinyId: req.params.tinyId, version: req.params.version}, function (err, result) {
            res.send(result);
        });
    });

    function CdeServe(req, res) {
        var _this = this;
        this.req = req;
        this.res = res;
        this.sendNativeXml = function (cde, res) {
            res.setHeader("Content-Type", "application/xml");
            var exportCde = cde.toObject();
            exportCde = exportShared.stripBsonIds(exportCde);
            res.send(js2xml("dataElement", exportCde));
        };
        this.serveCde = function (err, cde) {
            if (!cde) return res.status(404).send();
            cde = cdesvc.hideProprietaryCodes(cde, req.user);
            if (!req.query.type) res.send(cde);
            else if (req.query.type === 'json') _this.sendNativeJson(cde, res);
            else if (req.query.type === 'xml') _this.sendNativeXml(cde, res);
            else return res.status(404).send("Cannot recognize export type.");

            if (req.isAuthenticated()) {
                mongo_data_system.addToViewHistory(cde, req.user);
            }
            mongo_cde.incDeView(cde);
        }
    }

    app.get('/dataelement/:id', exportShared.nocacheMiddleware, function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        mongo_cde.byId(req.params.id, new CdeServe(req, res).serveCde);
    });


    app.get('/debytinyid/:tinyId/:version?', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.params.version) {
            mongo_cde.eltByTinyId(req.params.tinyId, new CdeServe(req, res).serveCde);
        } else {
            mongo_cde.byTinyIdAndVersion(req.params.tinyId, req.params.version, new CdeServe(req, res).serveCde);
        }
    });

    app.post('/debytinyid/:tinyId/:version?', cdesvc.save);

    app.post('/dataelement', cdesvc.save);

    app.get('/viewingHistory', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            var splicedArray = req.user.viewHistory.splice(0, 10);
            var idList = [];
            for (var i = 0; i < splicedArray.length; i++) {
                if (idList.indexOf(splicedArray[i]) === -1) idList.push(splicedArray[i]);
            }
            mongo_cde.cdesByTinyIdListInOrder(idList, function (err, cdes) {
                res.send(cdesvc.hideProprietaryCodes(cdes, req.user));
            });
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
                var diff = cdediff.diff(dataElement, priorDe);
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
            if (!err)
                res.send(cde);
            else
                res.status(403).end();
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
        mongo_cde.count({archived: false}, function (err, result) {
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
        var cdeMergeTo = req.body.merge;
        var cdeMergeFrom = req.body.cde;
        req.params.type = "received";
        cdeMergeFrom.registrationState.registrationStatus = "Retired";
        if (cdeMergeTo && cdeMergeTo.tinyId)
            cdeMergeFrom.changeNote = "Merged to tinyId " + cdeMergeTo.tinyId;
        mongo_cde.update(cdeMergeFrom, req.user, function () {
            res.end();
        })
    });
    app.post('/mergeCde', function (req, res) {
        var cdeMergeTo = req.body.mergeTo;
        var cdeMergeFrom = req.body.mergeFrom;
        if (cdeMergeTo && cdeMergeTo.tinyId)
            cdeMergeFrom.changeNote = "Merged to tinyId " + cdeMergeTo.tinyId;
        cdeMergeTo.changeNote = "Merged from tinyId " + cdeMergeFrom.tinyId;
        if (req.body.retireCde) {
            elastic.esClient.search({
                type: 'form',
                index: config.elastic.formIndex.name,
                q: cdeMergeFrom.tinyId
            }, function (err, result) {
                if (err) req.status(500).send(err);
                else if (result.hits.hits.length === 1) {
                    cdeMergeFrom.registrationState.registrationStatus = "Retired";
                    cdesvc.checkEligibleToRetire(req, res, cdeMergeFrom, () => {
                        mongo_cde.update(cdeMergeFrom, req.user, function (err) {
                            if (err) return res.status(500).send(err);
                            else
                                mongo_cde.update(cdeMergeTo, req.user, function (err) {
                                    if (err) return res.status(500).send(err);
                                    else res.status(200).end("retired");
                                })
                        })
                    })
                } else res.status(200).end();
            });
        } else {
            mongo_cde.update(cdeMergeFrom, req.user, function (err, newCdeMergeFrom) {
                if (err) return res.status(500).send(err);
                else mongo_cde.update(cdeMergeTo, req.user, function (err, newCdeMergeTo) {
                    if (err) return res.status(500).send(err);
                    else res.status(200).end();
                })
            })
        }
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
                    boardsvc.pinAllToBoard(req, cdes.cdes, res);
                });
            }
        } else {
            res.send("Please login first.");
        }
    });

    app.get('/cde/properties/keys', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
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
            res.send(elts.map(function (e) {
                return {tinyId: e._id}
            }));
        });
    });

    app.get('/esRecord/:id', function (req, res) {
        elastic.get(req.params.id, function (err, result) {
            if (err) throw err;
            else res.send(result);
        });
    });

    app.post('/classification/cde', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode_system.eltClassification(req.body, classificationShared.actions.create, mongo_cde, function (err) {
            if (!err) {
                res.send({code: 200, msg: "Classification Added"});
                mongo_data_system.addToClassifAudit({
                    date: new Date(),
                    user: {
                        username: req.user.username
                    },
                    elements: [{
                        _id: req.body.cdeId
                    }],
                    action: "add",
                    path: [req.body.orgName].concat(req.body.categories)
                });
            } else {
                res.send({code: 403, msg: "Classification Already Exists"});
            }

        });
    });

    app.delete('/classification/cde', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode_system.eltClassification(req.body, classificationShared.actions.delete, mongo_cde, function (err) {
            if (!err) {
                res.end();
                mongo_data_system.addToClassifAudit({
                    date: new Date(),
                    user: {
                        username: req.user.username
                    },
                    elements: [{
                        _id: req.query.cdeId
                    }],
                    action: "delete",
                    path: [req.query.orgName].concat(req.query.categories)
                });
            } else {
                res.status(202).send({error: {message: "Classification does not exists."}});
            }
        });
    });

};
