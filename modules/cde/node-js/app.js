var cdesvc = require('./cdesvc')
    , cdediff = require('./cdediff')
    , boardsvc = require('./../../board/node-js/boardsvc')
    , mongo_cde = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , classificationNode = require('./classificationNode')
    , classificationShared = require('@std/esm')(module)('../../system/shared/classificationShared')
    , vsac = require('./vsac-io')
    , config = require('../../system/node-js/parseConfig')
    , elastic = require('./elastic')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , path = require('path')
    , express = require('express')
    , sdc = require("./sdc.js")
    , appStatus = require('./../../system/node-js/status')
    , multer = require('multer')
    , elastic_system = require('../../system/node-js/elastic')
    , exportShared = require('@std/esm')(module)('../../system/shared/exportShared')
    , usersrvc = require('../../system/node-js/usersrvc')
;

exports.init = function (app, daoManager) {
    app.use("/cde/shared", express.static(path.join(__dirname, '../shared')));

    daoManager.registerDao(mongo_cde);

    app.get("/deById/:id", exportShared.nocacheMiddleware, cdesvc.byId);
    app.get("/deById/:id/priorDataElements/", exportShared.nocacheMiddleware, cdesvc.priorDataElements);

    app.get("/de/:tinyId", exportShared.nocacheMiddleware, cdesvc.byTinyId);
    app.get("/de/:tinyId/version/:version?", exportShared.nocacheMiddleware, cdesvc.byTinyIdVersion);
    app.get("/deList/:tinyIdList?", exportShared.nocacheMiddleware, cdesvc.byTinyIdList);

    app.get("/draftDataElement/:tinyId",cdesvc.draftDataElements);
    app.post("/draftDataElement/:tinyId",cdesvc.saveDraftDataElement);
    app.delete("/draftDataElement/:tinyId",cdesvc.deleteDraftDataElement);

    app.get("/de/:tinyId/latestVersion/", exportShared.nocacheMiddleware, cdesvc.latestVersionByTinyId);

    app.post("/de/:id?", cdesvc.createDataElement);
    app.put("/de/:tinyId", cdesvc.updateDataElement);

    app.get('/vsacBridge/:vsacId', exportShared.nocacheMiddleware, cdesvc.vsacId);

    app.get('/viewingHistory/dataElement', exportShared.nocacheMiddleware, cdesvc.viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    app.post('/myBoards', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) return res.status(403).send();
        elastic.myBoards(req.user, req.body, function (err, result) {
            if (err) return res.status(500).send("ERROR getting myBoards");
            res.send(result);
        });
    });

    app.post('/cdesByTinyIdList', function (req, res) {
        mongo_cde.byTinyIdList(req.body, function (err, cdes) {
            if (err) return res.status(500).send();
            res.send(cdes);
        });
    });

    app.get('/listOrgsFromDEClassification', exportShared.nocacheMiddleware, function (req, res) {
        elastic.DataElementDistinct("classification.stewardOrg.name", function (result) {
            res.send(result);
        });
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
                let diff = cdediff.diff(dataElement, priorDe);
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
            if (err) return res.status(500).send("ERROR moving classification");
            res.send(cde);
        });
    });

    app.post('/attachments/cde/add', multer(config.multer), function (req, res) {
        adminItemSvc.addAttachment(req, res, mongo_cde);
    });

    app.post('/attachments/cde/remove', function (req, res) {
        adminItemSvc.removeAttachment(req, res, mongo_cde);
    });

    app.post('/attachments/cde/setDefault', function (req, res) {
        adminItemSvc.setAttachmentDefault(req, res, mongo_cde);
    });

    app.post('/comments/cde/add', function (req, res) {
        adminItemSvc.addComment(req, res, mongo_cde);
    });
    app.post('/comments/cde/remove', function (req, res) {
        adminItemSvc.removeComment(req, res, mongo_cde);
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
        mongo_cde.count({archived: false}, function (err, result) {
            res.send({count: result});
        });
    });

    let fetchRemoteData = function () {
        vsac.getTGT();
        elastic.fetchPVCodeSystemList();
    };

    // run every 1 hours
    fetchRemoteData();
    setInterval(fetchRemoteData, 1000 * 60 * 60);


    // from others to UMLS
    app.get('/umlsCuiFromSrc/:id/:src', function (req, res) {
        if (!config.umls.sourceOptions[req.params.src])
            return res.send("Source cannot be looked up, use UTS Instead.");
        vsac.umlsCuiFromSrc(req.params.id, req.params.src, res);
    });

    // from UMLS to others
    app.get('/umlsAtomsBridge/:id/:src', function (req, res) {
        if (!config.umls.sourceOptions[req.params.src])
            return res.send("Source cannot be looked up, use UTS Instead.");
        if (config.umls.sourceOptions[req.params.src].requiresLogin && !req.user)
            return res.status(403).send();
        vsac.getAtomsFromUMLS(req.params.id, req.params.src, res);
    });

    app.get('/crossWalkingVocabularies/:source/:code/:targetSource/', function (req, res) {
        if (!req.params.source || !req.params.code || !req.params.targetSource)
            return res.status(401).end();
        vsac.getCrossWalkingVocabularies(req.params.source, req.params.code, req.params.targetSource, function (err, result) {
            if (err) return res.status(500).send("ERROR getting crosswalk");
            if (result.statusCode === 200)
                return res.send({result: JSON.parse(result.body).result});
            return res.send({result: []});
        });
    });

    app.get('/searchUmls', function (req, res) {
        if (!req.user) return res.status(403).send();
        vsac.searchUmls(req.query.searchTerm, res);
    });

    app.get('/permissibleValueCodeSystemList', exportShared.nocacheMiddleware, function (req, res) {
        res.send(elastic.pVCodeSystemList);
    });

    app.get('/sdc/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        sdc.byTinyIdVersion(req, res);
    });

    app.get('/sdc/:id', exportShared.nocacheMiddleware, function (req, res) {
        sdc.byId(req, res);
    });

    app.get('/status/cde', appStatus.status);

    app.post('/pinEntireSearchToBoard', function (req, res) {
        if (!req.isAuthenticated()) res.send("Please login first.");
        let query = elastic_system.buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > config.maxPin) return res.status(403).send("Maximum number excesses.");
        elastic_system.elasticsearch(query, 'cde', function (err, cdes) {
            boardsvc.pinAllToBoard(req, cdes.cdes, res);
        });
    });

    app.get('/cde/properties/keys', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
    });

    app.post('/getCdeAuditLog', function (req, res) {
        if (!req.isAuthenticated() || !req.user.siteAdmin)
            return res.status(401).send("Not Authorized");
        mongo_cde.getCdeAuditLog(req.body, function (err, result) {
            res.send(result);
        });
    });

    app.post('/elasticSearchExport/cde', function (req, res) {
        let query = elastic_system.buildElasticSearchQuery(req.user, req.body);
        let exporters = {
            json: {
                export: function (res) {
                    let firstElt = true;
                    elastic_system.elasticSearchExport(function dataCb(err, elt) {
                        if (err) return res.status(423).send("ERROR with es search export");
                        res.type('application/json');
                        res.write("[");
                        if (elt) {
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
        let result = [];
        let term = req.params.term;
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
        let dstring = req.query.from;

        function badDate() {
            res.status(300).send("Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24");
        }

        if (!dstring) return badDate();
        if (dstring[4] !== '-' || dstring[7] !== '-') return badDate();
        if (dstring.indexOf('20') !== 0) return badDate();
        if (dstring[5] !== "0" && dstring[5] !== "1") return badDate();
        if (dstring[8] !== "0" && dstring[8] !== "1" && dstring[8] !== "2" && dstring[8] !== "3") return badDate();

        let date = new Date(dstring);
        mongo_cde.findModifiedElementsSince(date, function (err, elts) {
            res.send(elts.map(function (e) {
                return {tinyId: e._id};
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
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send("Not Authorized.");
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
                return;
            }
            res.send({code: 403, msg: "Classification Already Exists"});
        });
    });

    app.post('/addCdeClassification/', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send("You do not permission to do this.");
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send(invalidateRequest);
        classificationNode_system.addClassification(req.body, mongo_cde, function (err, result) {
            if (err) return res.status(500).send("ERROR adding classification");
            if (result === "Classification Already Exists") return res.status(409).send(result);
            res.send(result);
            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: "add",
                path: [req.body.orgName].concat(req.body.categories)
            });

        });
    });
    app.post("/removeCdeClassification/", function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send({error: "You do not permission to do this."});
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode_system.removeClassification(req.body, mongo_cde, function (err, elt) {
            if (err) return res.status(500).send({error: err});
            res.send(elt);
            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: "delete",
                path: [req.body.orgName].concat(req.body.categories)
            });
        });
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    app.get('/schema/cde', (req, res) => res.send(mongo_cde.DataElement.jsonSchema()));
};
