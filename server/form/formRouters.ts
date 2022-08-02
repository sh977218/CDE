import { CronJob } from 'cron';
import { RequestHandler, Response, Router } from 'express';
import { check, checkSchema } from 'express-validator';
import { toInteger, round } from 'lodash';
import { config, dbPlugins } from 'server';
import { handleError, handleNotFound, respondError } from 'server/errorHandler';
import { elasticsearchForm } from 'server/form/elastic';
import {
    viewHistory, byTinyId, byTinyIdAndVersion, latestVersionByTinyId, create, publishFromDraft, publishExternal, byId,
    priorForms, byTinyIdList, originalSourceByTinyIdSourceName, draftForEditByTinyId, draftSave, draftDelete,
    forEditById, forEditByTinyId, forEditByTinyIdAndVersion
} from 'server/form/formsvc';
import {
    formModel,
    getAuditLog
} from 'server/form/mongo-form';
import { syncLinkedForms, syncLinkedFormsProgress } from 'server/form/syncLinkedForms';
import { FormDocument } from 'server/mongo/mongoose/form.mongoose';
import { validateBody } from 'server/system/bodyValidator';
import {
    completionSuggest, elasticSearchExport, removeElasticFields, scrollExport, scrollNext
} from 'server/system/elastic';
import { respondHomeFull } from 'server/system/appRouters';
import {
    canCreateMiddleware,
    canEditByTinyIdMiddleware,
    canEditMiddleware,
    isOrgAuthorityMiddleware,
    loggedInMiddleware,
    nocacheMiddleware
} from 'server/system/authorization';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';
import { isSearchEngine } from 'server/system/helper';
import { stripBsonIdsElt } from 'shared/exportShared';
import { CbErr1 } from 'shared/models.model';
import { getEnvironmentHost } from 'shared/node/env';
import { SearchSettingsElastic } from 'shared/search/search.model';

const canEditMiddlewareForm = canEditMiddleware(dbPlugins.form);
const canEditByTinyIdMiddlewareForm = canEditByTinyIdMiddleware(dbPlugins.form);
const canViewDraftMiddlewareForm = canEditByTinyIdMiddlewareForm;

const allowXOrigin: RequestHandler = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
};

const allRequestsProcessing: RequestHandler = (req, res, next) => {
    // update green/blue env GLOBAL
    const env = getEnvironmentHost(config, req.headers.host || '');
    if (env) {
        (global as any).CURRENT_SERVER_ENV = env;
    }
    next();
};

require('express-async-errors');

const ucum = require('@lhncbc/ucum-lhc');
const ucumUtils = ucum.UcumLhcUtils.getInstance();

export function module() {
    const router = Router();

    // Those end points need to be defined before '/form/:tinyId'
    router.get('/form/search', (req, res) => {
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
                formModel.countDocuments(cond, undefined, handleNotFound({req, res}, totalCount => {
                    formModel.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError<FormDocument[]>({req, res}, forms => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) {
                            totalPages = totalPages + 1;
                        }
                        res.render('bot/formSearchOrg', {
                            forms,
                            totalPages,
                            selectedOrg
                        });
                    }));
                }));
            } else {
                res.render('bot/formSearch');
            }
        } else {
            respondHomeFull(req, res);
        }
    });
    router.get(['/schema/form', '/form/schema'], (req, res) => res.send((formModel as any).jsonSchema()));

    // Remove /form after July 1st 2020
    router.get(['/api/form/:tinyId', '/form/:tinyId'], allowXOrigin, nocacheMiddleware, allRequestsProcessing, byTinyId);
    router.get(['/api/form/:tinyId/version/:version?', '/form/:tinyId/version/:version?'],
        [allowXOrigin, nocacheMiddleware], byTinyIdAndVersion);

    router.get('/api/form/:tinyId/latestVersion/', nocacheMiddleware, latestVersionByTinyId);
    router.post('/api/form/search', allowXOrigin, nocacheMiddleware, (req, res) => {
        const settings: SearchSettingsElastic = req.body;
        settings.includeAggregations = false;
        if (!Array.isArray(settings.selectedStatuses)) {
            settings.selectedStatuses = ['Preferred Standard', 'Standard', 'Qualified'];
        }
        elasticsearchForm(settings, req.user)
            .then(
                result => {
                    if (!result) {
                        return res.status(400).send('invalid query');
                    }
                    dbPlugins.form.byTinyIdList(result.forms.map(item => item.tinyId))
                        .then(data => {
                            if (!data) {
                                res.status(404).send();
                                return;
                            }
                            const documentIndex = ((settings.page || 1) - 1) * settings.resultPerPage;
                            res.send({
                                resultsTotal: result.totalNumber,
                                resultsRetrieved: data.length,
                                from: documentIndex >= 0 ? documentIndex + 1 : 1,
                                docs: data,
                            });
                        }, respondError({req, res}));
                },
                errorMessage => {
                    if (errorMessage instanceof Error) {
                        return respondError({res});
                    }
                    return res.status(422).send(errorMessage);
                }
            );
    });

    router.post('/server/form', canCreateMiddleware, create);
    router.post('/server/form/publish', canEditMiddlewareForm, publishFromDraft);
    router.post('/server/form/publishExternal', canEditMiddlewareForm, publishExternal);

    router.get('/server/form/byId/:id', nocacheMiddleware, allRequestsProcessing, byId);
    router.get('/server/form/priors/:id/', nocacheMiddleware, priorForms);

    router.get('/server/form/list/:tinyIdList?', nocacheMiddleware, byTinyIdList);
    router.get('/server/form/originalSource/:sourceName/:tinyId', originalSourceByTinyIdSourceName);

    router.get('/server/form/draft/:tinyId', canViewDraftMiddlewareForm, draftForEditByTinyId);
    router.put('/server/form/draft/:tinyId', canEditMiddlewareForm, draftSave);
    router.delete('/server/form/draft/:tinyId', canEditByTinyIdMiddlewareForm, draftDelete);

    router.get('/server/form/viewingHistory', loggedInMiddleware, nocacheMiddleware, viewHistory);

    router.get('/server/form/forEdit/:tinyId', nocacheMiddleware, checkSchema({
            tinyId: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 5
                    }
                }
            }
        }),
        validateBody, forEditByTinyId);
    router.get('/server/form/forEdit/:tinyId/version/:version?', nocacheMiddleware, checkSchema({
            tinyId: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 5
                    }
                }
            }
        }),
        validateBody, forEditByTinyIdAndVersion);
    router.get('/server/form/forEditById/:id', nocacheMiddleware, checkSchema({
            id: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 24,
                        max: 24
                    }
                }
            }
        }),
        validateBody, forEditById);

    /* ---------- PUT NEW REST API above ---------- */

    router.post('/server/form/search', (req, res) => {
        elasticsearchForm(req.body, req.user)
            .then(
                result => res.send(result),
                errorMessage => {
                    if (errorMessage instanceof Error) {
                        return respondError({res});
                    }
                    return res.status(422).send(errorMessage);
                }
            );
    });
    router.post('/server/form/searchExport', (req, res) => {
        const query = buildElasticSearchQuery(req.user, req.body);
        const exporters = {
            json: {
                export(res: Response) {
                    let firstElt = true;
                    res.type('application/json');
                    res.write('[');
                    elasticSearchExport('form', query, handleError({req, res}, (elt) => {
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
                    }));
                }
            }
        };
        exporters.json.export(res);
    });
    router.post('/server/form/scrollExport', (req, res) => {
        const query = buildElasticSearchQuery(req.user, req.body);
        scrollExport(query, 'form', handleNotFound({res, statusCode: 400}, response => res.send(response.body)));
    });
    router.get('/server/form/scrollExport/:scrollId', (req, res) => {
        scrollNext(req.params.scrollId, handleNotFound({res, statusCode: 400}, response => res.send(response.body)));
    });

    router.post('/server/form/getAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        getAuditLog(req.body, (err, result) => res.send(result));
    });

    router.post('/server/form/completion/:term', nocacheMiddleware, (req, res) => {
        const term = req.params.term;
        completionSuggest(term, req.user, req.body, config.elastic.formSuggestIndex.name, (err, resp) => {
            if (err || !resp) {
                throw new Error('/formCompletion failed');
            }
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    router.get('/formView', (req, res) => {
        const tinyId = req.query.tinyId as string;
        const version = req.query.version as string;
        if (isSearchEngine(req)) {
            dbPlugins.form.byTinyIdAndVersionOptional(tinyId, version)
                .then(cde => {
                res.render('bot/formView', {elt: cde});
            }, respondError({req, res}));
        } else {
            respondHomeFull(req, res);
        }
    });

    router.get('/server/ucumConvert', (req, res) => {
        const value = req.query.value === '0' ? 1e-20 : parseFloat(req.query.value as string); // 0 workaround
        const result = ucumUtils.convertUnitTo(req.query.from, value, req.query.to);
        if (result.status === 'succeeded') {
            const ret = Math.abs(result.toVal) < 1 ? round(result.toVal, 10) : result.toVal; // 0 workaround
            res.send('' + ret);
        } else {
            res.send('');
        }
    });

    router.get('/server/ucumSynonyms', check('uom').isAlphanumeric(), validateBody, (req, res) => {
        const uom = req.query.uom;

        const resp = ucumUtils.getSpecifiedUnit(uom, 'validate', 'false');
        if (!resp || !resp.unit) {
            return res.send([]);
        }

        const unit = resp.unit;
        const name = unit.name_;
        const synonyms = unit.synonyms_.split('; ');
        res.send([name, ...synonyms]);
    });

    router.get('/server/ucumNames', check('uom').isAlphanumeric(), validateBody, (req, res) => {
        const uom = req.query.uom;

        const resp = ucumUtils.getSpecifiedUnit(uom, 'validate', true);
        if (!resp || !resp.unit) {
            return res.send([]);
        } else {
            res.send([{
                name: resp.unit.name_,
                synonyms: resp.unit.synonyms_.split('; '),
                code: resp.unit.csCode_
            }]);
        }
    });

    function validateUom(uom: string, cb: CbErr1<string>) {
        let error;
        const validation = ucumUtils.validateUnitString(uom, true);
        if (validation.status === 'valid') {
            return cb(undefined, uom);
        }

        if (validation.suggestions && validation.suggestions.length) {
            if (validation.suggestions[0].units.length) {
                const suggestion = validation.suggestions[0].units[0];
                error = 'Unit is not found. Did you mean ' + suggestion[0] + ' (' + suggestion[1] + ')?';
            }
        } else {
            const suggestions: string[] = [];
            const synonyms = ucumUtils.checkSynonyms(uom);
            if (synonyms.status === 'succeeded' && synonyms.units.length) {
                synonyms.units.forEach((u: { code: string, name: string }) => u.name === uom ? suggestions.push(u.code) : null);
                if (suggestions.length) {
                    return cb(undefined, suggestions[0]);
                }

                error = 'Unit is not found. Did you mean ' + synonyms.units[0].name + '?';
            }
        }
        if (!error) {
            error = 'Unit is not found. ' + validation.msg.length ? validation.msg[0] : '';
        }
        cb(error, uom);
    }

    router.post('/server/ucumValidate', check('uoms').isArray(), validateBody, (req, res) => {
        const errors: (string | undefined)[] = [];
        const units: (string | undefined)[] = [];
        req.body.uoms.forEach((uom: string, i: number) => {
            validateUom(uom, (error, u) => {
                errors[i] = error;
                units[i] = u;
                if (!errors[i] && uom !== units[i]) {
                    errors[i] = 'Unit ' + uom + ' found but needs to be replaced with ' + units[i];
                }
            });
            if (i > 0 && !errors[0] && !errors[i]) {
                const result = ucumUtils.convertUnitTo(units[i], 1, units[0], true);
                if (result.status !== 'succeeded') {
                    errors[i] = 'Unit not compatible with first unit.' + (result.msg.length ? ' ' + result.msg[0] : '');
                }
            }
        });
        res.send({errors, units});
    });

    router.post('/server/syncLinkedForms', isOrgAuthorityMiddleware, (req, res) => {
        res.send();
        syncLinkedForms();
    });
    router.get('/server/syncLinkedForms', (req, res) => res.send(syncLinkedFormsProgress));

    /* tslint:disable */
    new CronJob('00 30 4 * * *', () => syncLinkedForms(), null, true, 'America/New_York').start();
    /* tslint:enable */

    return router;
}
