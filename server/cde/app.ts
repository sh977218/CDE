import { stripBsonIds } from 'shared/system/exportShared';
import { handleError } from '../errorHandler/errorHandler';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware,
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, nocacheMiddleware
} from '../system/authorization';
import { config } from '../system/parseConfig';
import { validatePvs } from '../cde/utsValidate';
import { byTinyIdVersion as deByTinyIdVersion, count as deCount, DataElement } from './mongo-cde';
import { respondHomeFull } from '../system/app';
import { isSearchEngine } from '../system/helper';
import { toInteger } from 'lodash';

const cdesvc = require('./cdesvc');
const mongoCde = require('./mongo-cde');
const elastic = require('./elastic');
const appStatus = require('../siteAdmin/status');
const elastic_system = require('../system/elastic');

const canEditMiddlewareDe = canEditMiddleware(mongoCde);
const canEditByTinyIdMiddlewareDe = canEditByTinyIdMiddleware(mongoCde);

export function init(app, daoManager) {
    daoManager.registerDao(mongoCde);

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

    app.get('/viewingHistory/dataElement', nocacheMiddleware, cdesvc.viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    app.post('/cdesByTinyIdList', (req, res) => {
        mongoCde.byTinyIdList(req.body, handleError({req, res}, cdes => res.send(cdes)));
    });

    app.post('/elasticSearch/cde', (req, res) => {
        elastic.elasticsearch(req.user, req.body, (err, result) => {
            if (err) { return res.status(400).send('invalid query'); }
            cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/moreLikeCde/:tinyId', nocacheMiddleware, (req, res) => {
        elastic.morelike(req.params.tinyId, result => {
            cdesvc.hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    app.get('/cde/derivationOutputs/:inputCdeTinyId', (req, res) => {
        mongoCde.derivationOutputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    app.get('/status/cde', appStatus.status);

    app.post('/getCdeAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongoCde.getAuditLog(req.body, (err, result) => {
            res.send(result);
        });
    });

    app.post('/elasticSearchExport/cde', (req, res) => {
        const query = elastic_system.buildElasticSearchQuery(req.user, req.body);
        const exporters = {
            json: {
                export(res) {
                    let firstElt = true;
                    let typeSent = false;
                    elastic_system.elasticSearchExport((err, elt) => {
                        if (err) {
                            if (!typeSent) { res.status(403); }
                            return res.send('ERROR with es search export');
                        }
                        if (!typeSent) {
                            res.type('application/json');
                            res.write('[');
                            typeSent = true;
                        }
                        if (elt) {
                            if (!firstElt) { res.write(','); }
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

    app.get('/cde/search', (req, res) => {
        const selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page; // starting from 1
        if (!pageString) { pageString = '1'; }
        if (isSearchEngine(req)) {
            if (selectedOrg) {
                const pageNum = toInteger(pageString);
                const pageSize = 20;
                const cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                deCount(cond, handleError({req, res}, totalCount => {
                    DataElement.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError({req, res}, cdes => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) { totalPages = totalPages + 1; }
                        res.render('bot/cdeSearchOrg', 'system', {
                            cdes,
                            totalPages,
                            selectedOrg
                        });
                    }));
                }));
            } else {
                res.render('bot/cdeSearch', 'system');
            }
        } else {
            respondHomeFull(req, res);
        }
    });

    app.get('/deView', (req, res) => {
        const {tinyId, version} = req.query;
        deByTinyIdVersion(tinyId, version, handleError({req, res}, cde => {
            if (isSearchEngine(req)) {
                res.render('bot/deView', 'system', {elt: cde});
            } else {
                respondHomeFull(req, res);
            }
        }));
    });


    app.post('/cdeCompletion/:term', nocacheMiddleware, (req, res) => {
        const term = req.params.term;
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

        if (!r.test(dstring)) { return badDate(); }

        const date = new Date(dstring);
        mongoCde.findModifiedElementsSince(date, (err, elts) => {
            res.send(elts.map(e =>  {
                return {tinyId: e._id};
            }));
        });
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    app.get('/schema/cde', (req, res) => res.send(mongoCde.DataElement.jsonSchema()));

    app.post('/umlsDe', (req, res) => {
        validatePvs(req.body).then(
            () => res.send(),
            err => res.status(400).send(err)
        );
    });
}
