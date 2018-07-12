const authorization = require('../system/authorization');
const authorizationShared = require('@std/esm')(module)("../../shared/system/authorizationShared");
const cdesvc = require('./cdesvc');
const boardsvc = require('../board/boardsvc');
const mongo_cde = require('./mongo-cde');
const mongo_data_system = require('../system/mongo-data');
const classificationNode_system = require('../system/classificationNode');
const classificationNode = require('./classificationNode');
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared');
const vsac = require('./vsac-io');
const config = require('../system/parseConfig');
const elastic = require('./elastic');
const adminItemSvc = require('../system/adminItemSvc.js');
const appStatus = require('../system/status');
const elastic_system = require('../system/elastic');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const handleError = require('../log/dbLogger').handleError;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_cde);

    app.get("/de/:tinyId", exportShared.nocacheMiddleware, cdesvc.byTinyId);
    app.get("/de/:tinyId/latestVersion/", exportShared.nocacheMiddleware, cdesvc.latestVersionByTinyId);
    app.get("/de/:tinyId/version/:version?", exportShared.nocacheMiddleware, cdesvc.byTinyIdAndVersion);
    app.post("/de/:id?", cdesvc.createDataElement);
    app.put("/de/:tinyId", cdesvc.updateDataElement);
    app.put("/dePublish/:tinyId", cdesvc.publishDataElement);

    app.get("/deById/:id", exportShared.nocacheMiddleware, cdesvc.byId);
    app.get("/deById/:id/priorDataElements/", exportShared.nocacheMiddleware, cdesvc.priorDataElements);

    app.get("/deList/:tinyIdList?", exportShared.nocacheMiddleware, cdesvc.byTinyIdList);

    app.get("/draftDataElement/:tinyId", cdesvc.draftDataElement);
    app.post("/draftDataElement/:tinyId", [authorization.canEditMiddleware], cdesvc.saveDraftDataElement);

    app.delete("/draftDataElement/:tinyId", (req, res, next) => {
        if (!authorizationShared.isOrgCurator(req.user)) return res.status(401).send();
        mongo_cde.byTinyId(req.params.tinyId, handleError({req, res}, dataElement => {
            if (!dataElement) return res.send();
            if (!authorizationShared.isOrgCurator(req.user, dataElement.stewardOrg.name)) return res.status(401).send();
            next();
        }));
    }, cdesvc.deleteDraftDataElement);

    app.get("/draftDataElementById/:id", cdesvc.draftDataElementById);

    app.get('/vsacBridge/:vsacId', exportShared.nocacheMiddleware, cdesvc.vsacId);

    app.get('/viewingHistory/dataElement', exportShared.nocacheMiddleware, cdesvc.viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    app.post('/myBoards', [exportShared.nocacheMiddleware, authorization.isAuthenticatedMiddleware], (req, res) => {
        elastic.myBoards(req.user, req.body, handleError({req, res}, result => {
            res.send(result);
        }));
    });

    app.post('/cdesByTinyIdList', (req, res) => {
        mongo_cde.byTinyIdList(req.body, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    app.post('/elasticSearch/cde', (req, res) => {
        elastic.elasticsearch(req.user, req.body, function (err, result) {
            if (err) return res.status(400).send("invalid query");
            result.cdes = cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/elasticSearch/count', (req, res) => {
        elastic_system.nbOfCdes((err, result) => res.send("" + result));
    });

    app.post('/classification/cde/moveclassif', (req, res) => {
        classificationNode.moveClassifications(req, handleError({req, res}, cde => {
            res.send(cde);
        }));
    });

    app.post('/attachments/cde/add', multer(config.multer), (req, res) => {
        adminItemSvc.addAttachment(req, res, mongo_cde);
    });

    app.post('/attachments/cde/remove', (req, res) => {
        adminItemSvc.removeAttachment(req, res, mongo_cde);
    });

    app.post('/attachments/cde/setDefault', (req, res) => {
        adminItemSvc.setAttachmentDefault(req, res, mongo_cde);
    });

    app.get('/moreLikeCde/:tinyId', exportShared.nocacheMiddleware, (req, res) => {
        elastic.morelike(req.params.tinyId, function (result) {
            result.cdes = cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get("/cde/derivationOutputs/:inputCdeTinyId", (req, res) => {
        mongo_cde.derivationOutputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    app.post('/desByConcept', (req, res) => {
        mongo_cde.desByConcept(req.body, result => {
            res.send(cdesvc.hideProprietaryCodes(result, req.user));
        });
    });

    app.get('/deCount', (req, res) => {
        mongo_cde.count({archived: false}, (err, result) => {
            res.send({count: result});
        });
    });

    // run every 1 hour
    function fetchRemoteData() {
        vsac.getTGT(300); // retry for half hour every 6 seconds
        elastic.fetchPVCodeSystemList();
    }
    fetchRemoteData();
    setInterval(fetchRemoteData, 1000 * 60 * 60);

    // from others to UMLS
    app.get('/umlsCuiFromSrc/:id/:src', (req, res) => {
        if (!config.umls.sourceOptions[req.params.src])
            return res.send("Source cannot be looked up, use UTS Instead.");
        vsac.umlsCuiFromSrc(req.params.id, req.params.src, res);
    });

    // from UMLS to others
    app.get('/umlsAtomsBridge/:id/:src', (req, res) => {
        if (!config.umls.sourceOptions[req.params.src])
            return res.send("Source cannot be looked up, use UTS Instead.");
        if (config.umls.sourceOptions[req.params.src].requiresLogin && !req.user)
            return res.status(403).send();
        vsac.getAtomsFromUMLS(req.params.id, req.params.src, res);
    });

    app.get('/crossWalkingVocabularies/:source/:code/:targetSource/', (req, res) => {
        if (!req.params.source || !req.params.code || !req.params.targetSource)
            return res.status(401).end();
        vsac.getCrossWalkingVocabularies(req.params.source, req.params.code, req.params.targetSource, handleError({req, res}, result => {
            if (result.statusCode === 200)
                return res.send({result: JSON.parse(result.body).result});
            return res.send({result: []});
        });
    });

    app.get('/searchUmls', authorization.isAuthenticatedMiddleware, (req, res) => {
        vsac.searchUmls(req.query.searchTerm, res);
    });

    app.get('/permissibleValueCodeSystemList', exportShared.nocacheMiddleware, (req, res) => {
        res.send(elastic.pVCodeSystemList);
    });

    app.get('/status/cde', appStatus.status);

    app.post('/pinEntireSearchToBoard', authorization.isAuthenticatedMiddleware, (req, res) => {
        let query = elastic_system.buildElasticSearchQuery(req.user, req.body.query);
        if (query.size > config.maxPin) return res.status(403).send("Maximum number excesses.");
        elastic_system.elasticsearch('cde', query, req.body.query, (err, cdes) => {
            boardsvc.pinAllToBoard(req, res, cdes.cdes);
        });
    });

    app.get('/cde/properties/keys', exportShared.nocacheMiddleware, (req, res) => {
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
    });

    app.post('/getCdeAuditLog', authorization.isOrgAuthorityMiddleware, (req, res) => {
        mongo_cde.getCdeAuditLog(req.body, (err, result) => {
            res.send(result);
        });
    });

    app.post('/elasticSearchExport/cde', (req, res) => {
        let query = elastic_system.buildElasticSearchQuery(req.user, req.body);
        let exporters = {
            json: {
                export: function (res) {
                    let firstElt = true;
                    let typeSent = false;
                    elastic_system.elasticSearchExport((err, elt) => {
                        if (err) {
                            if (!typeSent) res.status(403);
                            return res.send("ERROR with es search export");
                        }
                        if (!typeSent) {
                            res.type('application/json');
                            res.write("[");
                            typeSent = true;
                        }
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

    app.post('/cdeCompletion/:term', exportShared.nocacheMiddleware, (req, res) => {
        let term = req.params.term;
        elastic_system.completionSuggest(term, req.user, req.body, config.elastic.index.name, resp => {
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    app.get('/api/cde/modifiedElements', (req, res) => {
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

    app.post('/classification/cde', (req, res) => {
        if (!authorizationShared.isOrgCurator(req.user, req.body.orgName)) return res.status(401).send("Not Authorized.");
        classificationNode_system.eltClassification(req.body, classificationShared.actions.create, mongo_cde, err => {
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

    app.post('/addCdeClassification/', (req, res) => {
        if (!authorizationShared.isOrgCurator(req.user, req.body.orgName)) return res.status(401).send("You do not permission to do this.");
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send(invalidateRequest);
        classificationNode_system.addClassification(req.body, mongo_cde, handleError({req, res}, result => {
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

        }));
    });
    app.post("/removeCdeClassification/", (req, res) => {
        if (!authorizationShared.isOrgCurator(req.user, req.body.orgName)) return res.status(401).send({error: "You do not permission to do this."});
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode_system.removeClassification(req.body, mongo_cde, handleError({req, res}, elt => {
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
        }));
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    app.get('/schema/cde', (req, res) => res.send(mongo_cde.DataElement.jsonSchema()));
};
