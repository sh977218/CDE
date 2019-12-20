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

    // Remove /de after June 1st 2020
    router.get(['/api/de/:tinyId', '/de/:tinyId'], nocacheMiddleware, byTinyId);
    router.get('/api/de/:tinyId/latestVersion/', nocacheMiddleware, latestVersionByTinyId);

    // Remove /de after June 1st 2020
    router.get(['/api/de/:tinyId/version/:version?', '/de/:tinyId/version/:version?'], nocacheMiddleware, byTinyIdAndVersion);

    router.post('/server/de', canCreateMiddleware, create);
    router.post('/server/de/publish', canEditMiddlewareDe, publishFromDraft);
    router.post('/server/de/publishExternal', canEditMiddlewareDe, publishExternal);

    router.get('/server/de/byId/:id', nocacheMiddleware, byId);
    router.get('/server/de/priors/:id', nocacheMiddleware, priorDataElements);

    router.get('/server/de/list/:tinyIdList?', nocacheMiddleware, byTinyIdList);

    router.get('/server/de/originalSource/:sourceName/:tinyId', originalSourceByTinyIdSourceName);

    router.get('/server/de/draft/:tinyId', isOrgCuratorMiddleware, draftForEditByTinyId);
    router.put('/server/de/draft/:tinyId', canEditMiddlewareDe, draftSave);
    router.delete('/server/de/draft/:tinyId', canEditByTinyIdMiddlewareDe, draftDelete);

    router.get('/server/de/viewingHistory', nocacheMiddleware, viewHistory);

    /* ---------- PUT NEW REST API above ---------- */

    router.post('/server/de/byTinyIdList', (req, res) => {
        mongoCde.byTinyIdList(req.body, handleError({req, res}, cdes => res.send(cdes)));
    });

    router.post('/server/de/search', (req, res) => {
        elasticsearch(req.user, req.body, (err, result) => {
            if (err || !result) { return res.status(400).send('invalid query'); }
            hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    router.get('/server/de/moreLike/:tinyId', nocacheMiddleware, (req, res) => {
        morelike(req.params.tinyId, result => {
            hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });

    router.get('/server/de/derivationOutputs/:inputCdeTinyId', (req, res) => {
        mongoCde.derivationOutputs(req.params.inputCdeTinyId, handleError({req, res}, cdes => {
            res.send(cdes);
        }));
    });

    router.post('/server/de/getAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongoCde.getAuditLog(req.body, (err, result) => {
            res.send(result);
        });
    });

    router.post('/server/de/searchExport', (req, res) => {
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

    router.get(['/cde/search', '/de/search'], (req, res) => {
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

    router.post('/server/de/completion/:term', nocacheMiddleware, (req, res) => {
        const term = req.params.term;
        completionSuggest(term, req.user, req.body, config.elastic.cdeSuggestIndex.name, (err, resp) => {
            if (err || !resp) {
                throw new Error('/cdeCompletion error');
            }
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    router.get('/api/de/modifiedElements', (req, res) => {
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

    router.get(['/schema/cde', '/de/schema'], (req, res) => res.send((mongoCde.dataElementModel as any).jsonSchema()));

    router.post('/server/de/umls', (req, res) => {
        validatePvs(req.body).then(
            () => res.send(),
            err => res.status(400).send(err)
        );
    });
    return router;
}
