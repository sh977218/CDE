import { stripBsonIds } from 'shared/system/exportShared';
import { handleError } from '../errorHandler/errorHandler';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware, isOrgAuthorityMiddleware, isOrgCuratorMiddleware,
    nocacheMiddleware
} from '../system/authorization';
import { config } from '../system/parseConfig';
import { validatePvs } from '../../server/cde/utsValidate';

const cdesvc = require('./cdesvc');
const mongo_cde = require('./mongo-cde');
const elastic = require('./elastic');
const adminItemSvc = require('../system/adminItemSvc');
const appStatus = require('../siteAdmin/status');
const elastic_system = require('../system/elastic');

const canEditMiddlewareDe = canEditMiddleware(mongo_cde);
const canEditByTinyIdMiddlewareDe = canEditByTinyIdMiddleware(mongo_cde);

export function init(app, daoManager) {
    daoManager.registerDao(mongo_cde);

    app.get('/de/:tinyId', nocacheMiddleware, cdesvc.byTinyId);
    app.get('/de/:tinyId/latestVersion/', nocacheMiddleware, cdesvc.latestVersionByTinyId);
    app.get('/de/:tinyId/version/:version?', nocacheMiddleware, cdesvc.byTinyIdAndVersion);
    app.post('/de', canCreateMiddleware, cdesvc.create);
    app.post('/dePublish', canEditMiddlewareDe, cdesvc.publishFromDraft);
    app.post('/dePublishExternal', canEditMiddlewareDe, cdesvc.publishExternal);

    app.get('/deById/:id', nocacheMiddleware, cdesvc.byId);
    app.get('/deById/:id/priorDataElements/', nocacheMiddleware, cdesvc.priorDataElements);

    app.get('/deList/:tinyIdList?', nocacheMiddleware, cdesvc.byTinyIdList);

    app.get('/originalSource/cde/:sourceName/:tinyId', cdesvc.originalSourceByTinyIdSourceName);

    app.get('/draftDataElement/:tinyId', isOrgCuratorMiddleware, cdesvc.draftForEditByTinyId);
    app.put('/draftDataElement/:tinyId', canEditMiddlewareDe, cdesvc.draftSave);
    app.delete('/draftDataElement/:tinyId', canEditByTinyIdMiddlewareDe, cdesvc.draftDelete);

    app.get('/draftDataElementById/:id', cdesvc.draftById);

    app.get('/viewingHistory/dataElement', nocacheMiddleware, cdesvc.viewHistory);

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

    app.get('/moreLikeCde/:tinyId', nocacheMiddleware, (req, res) => {
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

    app.get('/cde/properties/keys', nocacheMiddleware, (req, res) => {
        adminItemSvc.allPropertiesKeys(req, res, mongo_cde);
    });

    app.post('/getCdeAuditLog', isOrgAuthorityMiddleware, (req, res) => {
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
                            elt = stripBsonIds(elt);
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

    app.post('/cdeCompletion/:term', nocacheMiddleware, (req, res) => {
        let term = req.params.term;
        elastic_system.completionSuggest(term, req.user, req.body, config.elastic.cdeSuggestIndex.name, resp => {
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    app.get('/api/cde/modifiedElements', (req, res) => {
        const dstring = req.query.from;

        const r = /20[0-2][0-9]-[0-1][0-9]-[0-3][0-9]/;

        function badDate() {
            res.status(300).send('Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24');
        }

        if (!r.test(dstring)) return badDate();

        let date = new Date(dstring);
        mongo_cde.findModifiedElementsSince(date, function (err, elts) {
            res.send(elts.map(function (e) {
                return {tinyId: e._id};
            }));
        });
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    app.get('/schema/cde', (req, res) => res.send(mongo_cde.DataElement.jsonSchema()));

    app.post('/umlsDe', (req, res) => {
        validatePvs(req.body).then(
            () => res.send(),
            (err) => res.status(400).send(err)
        );
    });
}
