const authorization = require('../system/authorization');
const cdesvc = require('./cdesvc');
const mongo_cde = require('./mongo-cde');
const config = require('../system/parseConfig');
const elastic = require('./elastic');
const adminItemSvc = require('../system/adminItemSvc.js');
const appStatus = require('../siteAdmin/status');
const elastic_system = require('../system/elastic');
const exportShared = require('esm')(module)('../../shared/system/exportShared');
const handleError = require('../errorHandler/errHandler').handleError;

const canCreateMiddleware = authorization.canCreateMiddleware;
const canEditMiddleware = authorization.canEditMiddleware(mongo_cde);
const canEditByTinyIdMiddleware = authorization.canEditByTinyIdMiddleware(mongo_cde);

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_cde);

    app.get('/de/:tinyId', authorization.nocacheMiddleware, cdesvc.byTinyId);
    app.get('/de/:tinyId/latestVersion/', authorization.nocacheMiddleware, cdesvc.latestVersionByTinyId);
    app.get('/de/:tinyId/version/:version?', authorization.nocacheMiddleware, cdesvc.byTinyIdAndVersion);
    app.post('/de', canCreateMiddleware, cdesvc.create);
    app.post('/dePublish', canEditMiddleware, cdesvc.publishFromDraft);
    app.post('/dePublishExternal', canEditMiddleware, cdesvc.publishExternal);

    app.get('/deById/:id', authorization.nocacheMiddleware, cdesvc.byId);
    app.get('/deById/:id/priorDataElements/', authorization.nocacheMiddleware, cdesvc.priorDataElements);

    app.get('/deList/:tinyIdList?', authorization.nocacheMiddleware, cdesvc.byTinyIdList);

    app.get('/originalSource/cde/:sourceName/:tinyId', cdesvc.originalSourceByTinyIdSourceName);

    app.get('/draftDataElement/:tinyId', authorization.isOrgCuratorMiddleware, cdesvc.draftForEditByTinyId);
    app.put('/draftDataElement/:tinyId', canEditMiddleware, cdesvc.draftSave);
    app.delete('/draftDataElement/:tinyId', canEditByTinyIdMiddleware, cdesvc.draftDelete);

    app.get('/draftDataElementById/:id', cdesvc.draftById);

    app.get('/viewingHistory/dataElement', authorization.nocacheMiddleware, cdesvc.viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    app.post('/cdesByTinyIdList', (req, res) => {
        mongo_cde.byTinyIdList(req.body, handleError({req, res}, cdes => res.send(cdes)));
    });

    app.post('/elasticSearch/cde', (req, res) => {
        elastic.elasticsearch(req.user, req.body, function (err, result) {
            if (err) return res.status(400).send('invalid query');
            cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/elasticSearch/count', (req, res) => {
        elastic_system.nbOfCdes((err, result) => res.send("" + result));
    });

    app.get('/moreLikeCde/:tinyId', authorization.nocacheMiddleware, (req, res) => {
        elastic.morelike(req.params.tinyId, result => {
            cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/cde/derivationOutputs/:inputCdeTinyId', (req, res) => {
        mongo_cde.derivationOutputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    app.post('/desByConcept', (req, res) => {
        mongo_cde.desByConcept(req.body, result => {
            cdesvc.hideProprietaryCodes(result, req.user);
            res.send(result);
        });
    });

    app.get('/deCount', (req, res) => {
        mongo_cde.count({archived: false}, (err, result) => {
            res.send({count: result});
        });
    });

    app.get('/status/cde', appStatus.status);

    app.get('/cde/properties/keys', authorization.nocacheMiddleware, (req, res) => {
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
    });

    app.post('/getCdeAuditLog', authorization.isOrgAuthorityMiddleware, (req, res) => {
        mongo_cde.getAuditLog(req.body, (err, result) => {
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
                            return res.send('ERROR with es search export');
                        }
                        if (!typeSent) {
                            res.type('application/json');
                            res.write('[');
                            typeSent = true;
                        }
                        if (elt) {
                            if (!firstElt) res.write(',');
                            elt = exportShared.stripBsonIds(elt);
                            elt = elastic_system.removeElasticFields(elt);
                            res.write(JSON.stringify(elt));
                            firstElt = false;
                        } else {
                            res.write(']');
                            res.send();
                        }
                    }, query, 'cde');
                }
            }
        };
        exporters.json.export(res);
    });

    app.post('/cdeCompletion/:term', authorization.nocacheMiddleware, (req, res) => {
        let term = req.params.term;
        elastic_system.completionSuggest(term, req.user, req.body, config.elastic.cdeSuggestIndex.name, resp => {
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    app.get('/api/cde/modifiedElements', (req, res) => {
        let dstring = req.query.from;

        function badDate() {
            res.status(300).send('Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24');
        }

        if (!dstring) return badDate();
        if (dstring[4] !== '-' || dstring[7] !== '-') return badDate();
        if (dstring.indexOf('20') !== 0) return badDate();
        if (dstring[5] !== '0' && dstring[5] !== '1') return badDate();
        if (dstring[8] !== '0' && dstring[8] !== '1' && dstring[8] !== '2' && dstring[8] !== '3') return badDate();

        let date = new Date(dstring);
        mongo_cde.findModifiedElementsSince(date, function (err, elts) {
            res.send(elts.map(function (e) {
                return {tinyId: e._id};
            }));
        });
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    app.get('/schema/cde', (req, res) => res.send(mongo_cde.DataElement.jsonSchema()));
};
