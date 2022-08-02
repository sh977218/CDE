import { Response, Router } from 'express';
import { toInteger } from 'lodash';
import { config, dbPlugins } from 'server';
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
import { getAuditLog } from 'server/cde/mongo-cde';
import { validatePvs } from 'server/cde/utsValidate';
import { handleError, respondError } from 'server/errorHandler';
import { storeQuery } from 'server/log/storedQueryDb';
import { DataElementDocument, dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { respondHomeFull } from 'server/system/appRouters';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware,
    isOrgAuthorityMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';
import { completionSuggest, elasticSearchExport, removeElasticFields } from 'server/system/elastic';
import { isSearchEngine } from 'server/system/helper';
import { stripBsonIdsElt } from 'shared/exportShared';
import { SearchSettingsElastic } from 'shared/search/search.model';

const canEditMiddlewareDe = canEditMiddleware(dbPlugins.dataElement);
const canEditByTinyIdMiddlewareDe = canEditByTinyIdMiddleware(dbPlugins.dataElement);
const canViewDraftMiddlewareDe = canEditByTinyIdMiddlewareDe;

require('express-async-errors');

export function module() {
    const router = Router();

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
                dbPlugins.dataElement.count(cond).then(totalCount => {
                    dataElementModel.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError<DataElementDocument[]>({req, res}, cdes => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) {
                            totalPages = totalPages + 1;
                        }
                        res.render('bot/cdeSearchOrg', {
                            cdes,
                            totalPages,
                            selectedOrg
                        });
                    }));
                }, respondError({req, res}));
            } else {
                res.render('bot/cdeSearch');
            }
        } else {
            respondHomeFull(req, res);
        }
    });
    require('mongoose-schema-jsonschema')(require('mongoose'));
    router.get(['/schema/cde', '/schema/de', '/de/schema'], (req, res) => res.send((dataElementModel as any).jsonSchema()));

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
    router.post('/server/de/byTinyIdList', (req, res): Promise<Response> => {
        return dbPlugins.dataElement.byTinyIdListElastic(req.body)
            .then(items => {
                hideProprietaryCodes(items, req.user);
                return res.send(items);
            }, respondError({req, res}));
    });
    router.get('/server/de/derivationOutputs/:inputCdeTinyId', derivationOutputs);

    /* ---------- PUT NEW REST API above ---------- */
    router.post('/api/de/search', (req, res) => {
        const settings: SearchSettingsElastic = req.body;
        settings.includeAggregations = false;
        if (!Array.isArray(settings.selectedStatuses)) {
            settings.selectedStatuses = ['Preferred Standard', 'Standard', 'Qualified'];
        }
        elasticsearch(req.user, settings, (err, result) => {
            if (err || !result) {
                return res.status(400).send('invalid query');
            }
            dbPlugins.dataElement.byTinyIdList(result.cdes.map(item => item.tinyId))
                .then(data => {
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
                }, respondError({req, res}));
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
                            } else {
                                storeQuery(req.body);
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
        getAuditLog(req.body, (err, result) => {
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
            dbPlugins.dataElement.byTinyIdAndVersionOptional(tinyId as string, version as string)
                .then(de => {
                    res.render('bot/deView', {elt: de});
                }, respondError({req, res}));
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
