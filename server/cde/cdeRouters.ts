import { Router } from 'express';
import { toInteger } from 'lodash';
import {
    byId, byTinyId, byTinyIdAndVersion, byTinyIdList, create, draftDelete, draftForEditByTinyId, draftSave, hideProprietaryCodes,
    latestVersionByTinyId, originalSourceByTinyIdSourceName, priorDataElements, publishExternal, publishFromDraft, viewHistory
} from 'server/cde/cdesvc';
import { elasticsearch, morelike } from 'server/cde/elastic';
import * as mongoCde from 'server/cde/mongo-cde';
import { validatePvs } from 'server/cde/utsValidate';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { status } from 'server/siteAdmin/status';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware,
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { buildElasticSearchQuery, completionSuggest, elasticSearchExport, removeElasticFields } from 'server/system/elastic';
import { isSearchEngine } from 'server/system/helper';
import { config } from 'server/system/parseConfig';
import { stripBsonIdsElt } from 'shared/system/exportShared';
import { respondHomeFull } from 'server/system/appRouters';

const canEditMiddlewareDe = canEditMiddleware(mongoCde);
const canEditByTinyIdMiddlewareDe = canEditByTinyIdMiddleware(mongoCde);

const daoManager = require('../system/moduleDaoManager');

require('express-async-errors');

export function module() {
    const router = Router();

    daoManager.registerDao(mongoCde);

    router.get('/de/:tinyId', nocacheMiddleware, byTinyId);
    router.get('/de/:tinyId/latestVersion/', nocacheMiddleware, latestVersionByTinyId);
    router.get('/de/:tinyId/version/:version?', nocacheMiddleware, byTinyIdAndVersion);
    router.post('/de', canCreateMiddleware, create);
    router.post('/dePublish', canEditMiddlewareDe, publishFromDraft);
    router.post('/dePublishExternal', canEditMiddlewareDe, publishExternal);

    router.get('/deById/:id', nocacheMiddleware, byId);
    router.get('/deById/:id/priorDataElements/', nocacheMiddleware, priorDataElements);

    router.get('/deList/:tinyIdList?', nocacheMiddleware, byTinyIdList);

    router.get('/originalSource/cde/:sourceName/:tinyId', originalSourceByTinyIdSourceName);

    router.get('/draftDataElement/:tinyId', isOrgCuratorMiddleware, draftForEditByTinyId);
    router.put('/draftDataElement/:tinyId', canEditMiddlewareDe, draftSave);
    router.delete('/draftDataElement/:tinyId', canEditByTinyIdMiddlewareDe, draftDelete);

    router.get('/viewingHistory/dataElement', nocacheMiddleware, viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    router.post('/cdesByTinyIdList', (req, res) => {
        mongoCde.byTinyIdList(req.body, handleError({req, res}, cdes => res.send(cdes)));
    });

    router.post('/elasticSearch/cde', (req, res) => {
        elasticsearch(req.user, req.body, (err, result) => {
            if (err || !result) { return res.status(400).send('invalid query'); }
            hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    router.get('/moreLikeCde/:tinyId', nocacheMiddleware, (req, res) => {
        morelike(req.params.tinyId, result => {
            hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    router.get('/cde/derivationOutputs/:inputCdeTinyId', (req, res) => {
        mongoCde.derivationOutputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    router.get('/status/cde', status);

    router.post('/getCdeAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongoCde.getAuditLog(req.body, (err, result) => {
            res.send(result);
        });
    });

    router.post('/elasticSearchExport/cde', (req, res) => {
        const query = buildElasticSearchQuery(req.user, req.body);
        const exporters = {
            json: {
                export(res) {
                    let firstElt = true;
                    let typeSent = false;
                    elasticSearchExport('cde', query, (err, elt) => {
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
                            elt = stripBsonIdsElt(elt);
                            elt = removeElasticFields(elt);
                            res.write(JSON.stringify(elt));
                            firstElt = false;
                        } else {
                            res.write(']');
                            res.send();
                        }
                    });
                }
            }
        };
        exporters.json.export(res);
    });

    router.get('/cde/search', (req, res) => {
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
                mongoCde.count(cond, handleNotFound<number>({req, res}, totalCount => {
                    mongoCde.dataElementModel.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError({req, res}, cdes => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) { totalPages = totalPages + 1; }
                        res.render('bot/cdeSearchOrg', 'system' as any, {
                            cdes,
                            totalPages,
                            selectedOrg
                        } as any);
                    }));
                }));
            } else {
                res.render('bot/cdeSearch', 'system' as any);
            }
        } else {
            respondHomeFull(req, res);
        }
    });

    router.get('/deView', (req, res) => {
        const {tinyId, version} = req.query;
        mongoCde.byTinyIdVersion(tinyId, version, handleError({req, res}, cde => {
            if (isSearchEngine(req)) {
                res.render('bot/deView', 'system' as any, {elt: cde} as any);
            } else {
                respondHomeFull(req, res);
            }
        }));
    });


    router.post('/cdeCompletion/:term', nocacheMiddleware, (req, res) => {
        const term = req.params.term;
        completionSuggest(term, req.user, req.body, config.elastic.cdeSuggestIndex.name, (err, resp) => {
            if (err || !resp) {
                throw new Error('/cdeCompletion error');
            }
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    router.get('/api/cde/modifiedElements', (req, res) => {
        const dstring = req.query.from;

        const r = /20[0-2][0-9]-[0-1][0-9]-[0-3][0-9]/;

        function badDate() {
            res.status(300).send('Invalid date format, please provide as: /api/cde/modifiedElements?from=2015-12-24');
        }

        if (!r.test(dstring)) { return badDate(); }

        const date = new Date(dstring);
        mongoCde.findModifiedElementsSince(date, (err, elts) => {
            res.send(elts.map(e => ({tinyId: e._id})));
        });
    });

    require('mongoose-schema-jsonschema')(require('mongoose'));

    router.get('/schema/cde', (req, res) => res.send((mongoCde.dataElementModel as any).jsonSchema()));

    router.post('/umlsDe', (req, res) => {
        validatePvs(req.body).then(
            () => res.send(),
            err => res.status(400).send(err)
        );
    });
    return router;
}
