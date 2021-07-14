import { Response, Router } from 'express';
import { toInteger } from 'lodash';
import {
    byId, byTinyId, byTinyIdAndVersion, byTinyIdList, create, derivationOutputs, draftDelete, draftForEditByTinyId,
    draftSave,
    hideProprietaryCodes,
    latestVersionByTinyId, modifiedElements, moreLikeThis, originalSourceByTinyIdSourceName, priorDataElements,
    publishExternal,
    publishFromDraft,
    viewHistory
} from 'server/cde/cdesvc';
import { elasticsearch } from 'server/cde/elastic';
import * as mongoCde from 'server/cde/mongo-cde';
import { validatePvs } from 'server/cde/utsValidate';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { respondHomeFull } from 'server/system/appRouters';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware,
    isOrgAuthorityMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { completionSuggest, elasticSearchExport, removeElasticFields } from 'server/system/elastic';
import { isSearchEngine } from 'server/system/helper';
import { config } from 'server/system/parseConfig';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { stripBsonIdsElt } from 'shared/system/exportShared';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';

const canEditMiddlewareDe = canEditMiddleware(mongoCde);
const canEditByTinyIdMiddlewareDe = canEditByTinyIdMiddleware(mongoCde);
const canViewDraftMiddlewareDe = canEditByTinyIdMiddlewareDe;

const daoManager = require('../system/moduleDaoManager');

require('express-async-errors');

export function module() {
    const router = Router();
    daoManager.registerDao(mongoCde);

    // Those end points need to be defined before '/de/:tinyId'
    router.get(['/cde/search', '/de/search'], (req, res) => {
        const selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page; // starting from 1
        if (!pageString) {
            pageString = '1';
        }
        if (isSearchEngine(req)) {
            if (selectedOrg) {
                const pageNum = toInteger(pageString);
                const pageSize = 20;
                const cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                mongoCde.count(cond, handleNotFound({req, res}, totalCount => {
                    mongoCde.dataElementModel.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError({req, res}, cdes => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) {
                            totalPages = totalPages + 1;
                        }
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
    require('mongoose-schema-jsonschema')(require('mongoose'));
    router.get(['/schema/cde', '/schema/de', '/de/schema'], (req, res) => res.send((mongoCde.dataElementModel as any).jsonSchema()));

    router.get('/api/de/modifiedElements', modifiedElements);
    // Remove /de after June 1st 2020
    router.get(['/api/de/:tinyId', '/de/:tinyId'], nocacheMiddleware, byTinyId);
    router.get(['/api/de/:tinyId/version/:version?', '/de/:tinyId/version/:version?'], nocacheMiddleware, byTinyIdAndVersion);

    router.get('/api/de/:tinyId/latestVersion/', nocacheMiddleware, latestVersionByTinyId);
    router.post('/server/de', canCreateMiddleware, create);
    router.post('/server/de/publish', canEditMiddlewareDe, publishFromDraft);
    router.post('/server/de/publishExternal', canEditMiddlewareDe, publishExternal);

    router.get('/server/de/byId/:id', nocacheMiddleware, byId);
    router.get('/server/de/priors/:id', nocacheMiddleware, priorDataElements);

    router.get('/server/de/list/:tinyIdList?', nocacheMiddleware, byTinyIdList);
    router.get('/server/de/originalSource/:sourceName/:tinyId', originalSourceByTinyIdSourceName);

    router.get('/server/de/draft/:tinyId', canViewDraftMiddlewareDe, draftForEditByTinyId);
    router.put('/server/de/draft/:tinyId', canEditMiddlewareDe, draftSave);
    router.delete('/server/de/draft/:tinyId', canEditByTinyIdMiddlewareDe, draftDelete);

    router.get('/server/de/viewingHistory', nocacheMiddleware, viewHistory);
    router.get('/server/de/moreLike/:tinyId', nocacheMiddleware, moreLikeThis);
    router.post('/server/de/byTinyIdList', (req, res) => {
        mongoCde.byTinyIdListElastic(req.body, handleError({req, res}, cdes => res.send(cdes)));
    });
    router.get('/server/de/derivationOutputs/:inputCdeTinyId', derivationOutputs);

    /* ---------- PUT NEW REST API above ---------- */
    router.post('/api/de/search', (req, res) => {
        const settings: SearchSettingsElastic = req.body;
        settings.includeAggregations = false;
        if (!settings.resultPerPage) {
            settings.resultPerPage = 20;
        }
        if (settings.resultPerPage > 100) {
            settings.resultPerPage = 100;
        }
        if (!Array.isArray(settings.selectedElements)) {
            settings.selectedElements = [];
        }
        if (!Array.isArray(settings.selectedElementsAlt)) {
            settings.selectedElementsAlt = [];
        }
        if (!Array.isArray(settings.selectedStatuses)) {
            settings.selectedStatuses = ['Preferred Standard', 'Standard', 'Qualified'];
        }
        elasticsearch(req.user, settings, (err, result) => {
            if (err || !result) {
                return res.status(400).send('invalid query');
            }
            mongoCde.byTinyIdList(result.cdes.map(item => item.tinyId), handleError({req, res}, data => {
                if (!data) {
                    res.status(404).send();
                    return;
                }
                hideProprietaryCodes(data, req.user);
                const documentIndex = ((settings.page || 1) - 1) * settings.resultPerPage;
                res.send({
                    resultsTotal: result.totalNumber,
                    resultsRetrieved: data.length,
                    from: documentIndex >= 0 ? documentIndex + 1 : 1,
                    docs: data,
                });
            }));
        });
    });

    router.post('/server/de/search', (req, res) => {
        elasticsearch(req.user, req.body, (err, result) => {
            if (err || !result) {
                return res.status(400).send(`invalid query`);
            }
            hideProprietaryCodes(result.cdes, req.user);
            res.send(result);
        });
    });
    router.post('/server/de/searchExport', (req, res) => {
        const query = buildElasticSearchQuery(req.user, req.body);
        const exporters = {
            json: {
                export(res: Response) {
                    let firstElt = true;
                    let typeSent = false;
                    elasticSearchExport('cde', query, (err, elt) => {
                        if (err) {
                            if (!typeSent) {
                                res.status(403);
                            }
                            return res.send('ERROR with es search export');
                        }
                        if (!typeSent) {
                            res.type('application/json');
                            res.write('[');
                            typeSent = true;
                        }
                        if (elt) {
                            if (!firstElt) {
                                res.write(',');
                            }
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

    router.post('/server/de/getAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongoCde.getAuditLog(req.body, (err, result) => {
            res.send(result);
        });
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

    router.get('/deView', (req, res) => {
        const {tinyId, version} = req.query;
        if (isSearchEngine(req)) {
            mongoCde.byTinyIdVersion(tinyId, version, handleError({req, res}, cde => {
                res.render('bot/deView', 'system' as any, {elt: cde} as any);
            }));
        } else {
            respondHomeFull(req, res);
        }
    });

    router.post('/server/de/umls', (req, res) => {
        validatePvs(req.body).then(
            () => res.send(),
            validationErrors => res.send(validationErrors)
        );
    });
    return router;
}
