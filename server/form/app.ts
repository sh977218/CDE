import { Express, RequestHandler } from 'express';
import { toInteger } from 'lodash';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import {
    canCreateMiddleware, canEditByTinyIdMiddleware, canEditMiddleware,
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { config } from 'server/system/parseConfig';
import { isSearchEngine } from 'server/system/helper';
import { byTinyIdVersion as formByTinyIdVersion, formModel } from 'server/form/mongo-form';
import { respondHomeFull } from 'server/system/app';
import { validateBody } from 'server/system/bodyValidator';
import { completionSuggest, elasticSearchExport, removeElasticFields, scrollExport, scrollNext } from 'server/system/elastic';
import { getEnvironmentHost } from 'shared/env';
import { CbErr } from 'shared/models.model';
import { stripBsonIdsElt } from 'shared/system/exportShared';

const _ = require('lodash');
const dns = require('dns');
const os = require('os');
const formSvc = require('./formsvc');
const syncLinkedForms = require('./syncLinkedForms');
const mongoForm = require('./mongo-form');
const sharedElastic = require('../system/elastic');
const CronJob = require('cron').CronJob;
const { checkSchema, check } = require('express-validator');


const canEditMiddlewareForm = canEditMiddleware(mongoForm);
const canEditByTinyIdMiddlewareForm = canEditByTinyIdMiddleware(mongoForm);

// ucum from lhc uses IndexDB
(global as any).location = {origin: 'localhost'};
const setGlobalVars = require('indexeddbshim');
(global as any).window = global; // We'll allow ourselves to use `window.indexedDB` or `indexedDB` as a global
setGlobalVars();
const ucum = require('ucum').UcumLhcUtils.getInstance();

const allowXOrigin: RequestHandler = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
};

const allRequestsProcessing: RequestHandler = (req, res, next) => {
    // update green/blue env GLOBAL
    const env = getEnvironmentHost(config, req.headers.host);
    if (env) {
        (global as any).CURRENT_SERVER_ENV = env;
    }
    next();
};

export function init(app: Express, daoManager) {
    daoManager.registerDao(mongoForm);

    app.get('/form/search', (req, res) => {
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
                formModel.countDocuments(cond, handleNotFound({req, res}, totalCount => {
                    formModel.find(cond, 'tinyId designations', {
                        skip: pageSize * (pageNum - 1),
                        limit: pageSize
                    }, handleError({req, res}, forms => {
                        let totalPages = totalCount / pageSize;
                        if (totalPages % 1 > 0) { totalPages = totalPages + 1; }
                        res.render('bot/formSearchOrg', 'system' as any, {
                            forms,
                            totalPages,
                            selectedOrg
                        } as any);
                    }));
                }));
            } else {
                res.render('bot/formSearch', 'system' as any);
            }
        } else {
            respondHomeFull(req, res);
        }
    });


    app.get('/form/:tinyId', allowXOrigin, nocacheMiddleware, allRequestsProcessing, formSvc.byTinyId);
    app.get('/form/:tinyId/latestVersion/', nocacheMiddleware, formSvc.latestVersionByTinyId);
    app.get('/form/:tinyId/version/:version?', [allowXOrigin, nocacheMiddleware], formSvc.byTinyIdAndVersion);
    app.post('/form', canCreateMiddleware, formSvc.create);
    app.post('/formPublish', canEditMiddlewareForm, formSvc.publishFromDraft);
    app.post('/formPublishExternal', canEditMiddlewareForm, formSvc.publishExternal);

    app.get('/formById/:id', nocacheMiddleware, allRequestsProcessing, formSvc.byId);
    app.get('/formById/:id/priorForms/', nocacheMiddleware, formSvc.priorForms);

    app.get('/formForEdit/:tinyId', nocacheMiddleware,
        checkSchema({tinyId: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 5
                    }
                }
            }}),
        validateBody, formSvc.forEditByTinyId);

    app.get('/formForEdit/:tinyId/version/:version?', nocacheMiddleware,
        checkSchema({tinyId: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 5
                    }
                }
            }}),
        validateBody,
        formSvc.forEditByTinyIdAndVersion);

    app.get('/formForEditById/:id', nocacheMiddleware,
        checkSchema({id: {
                in: ['params'],
                isLength: {
                    options: {
                        min: 24,
                        max: 24
                    }
                }
            }}),
        validateBody,
        formSvc.forEditById);

    app.get('/formList/:tinyIdList?', nocacheMiddleware, formSvc.byTinyIdList);
    app.get('/originalSource/form/:sourceName/:tinyId', formSvc.originalSourceByTinyIdSourceName);

    app.get('/draftForm/:tinyId', isOrgCuratorMiddleware, formSvc.draftForEditByTinyId);
    app.put('/draftForm/:tinyId', canEditMiddlewareForm, formSvc.draftSave);
    app.delete('/draftForm/:tinyId', canEditByTinyIdMiddlewareForm, formSvc.draftDelete);

    // app.get('/draftFormById/:id', formSvc.draftForEditById);

    app.post('/form/publish/:id', loggedInMiddleware, formSvc.publishFormToHtml);

    app.get('/viewingHistory/form', loggedInMiddleware, nocacheMiddleware, (req, res) => {
        const splicedArray = req.user.formViewHistory.splice(0, 10);
        const idList: string[] = [];
        for (const sa of splicedArray) {
            if (idList.indexOf(sa) === -1) { idList.push(sa); }
        }
        mongoForm.byTinyIdListInOrder(idList, (err, forms) => {
            res.send(forms);
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.post('/elasticSearch/form', (req, res) => {
        const query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        if (query.size > 100) { return res.status(422).send('Too many results requested. (max 100)'); }
        if ((query.from + query.size) > 10000) { return res.status(422).send('Exceeded pagination limit (10,000)'); }
        if (!req.body.fullRecord) {
            query._source = {excludes: ['flatProperties', 'properties', 'classification.elements', 'formElements']};
        }
        sharedElastic.elasticsearch('form', query, req.body, handleNotFound({res, statusCode: 422}, result => {
            res.send(result);
        }));
    });

    app.post('/scrollExport/form', (req, res) => {
        const query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        scrollExport(query, 'form', handleNotFound({res, statusCode: 400}, response => res.send(response.body)));
    });

    app.get('/scrollExport/:scrollId', (req, res) => {
        scrollNext(req.params.scrollId, handleNotFound({res, statusCode: 400}, response => res.send(response.body)));
    });

    app.post('/getFormAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongoForm.getAuditLog(req.body, (err, result) => res.send(result));
    });

    app.post('/elasticSearchExport/form', (req, res) => {
        const query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        const exporters = {
            json: {
                export(res) {
                    let firstElt = true;
                    res.type('application/json');
                    res.write('[');
                    elasticSearchExport('form', query, handleError({req, res}, (elt) => {
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
                    }));
                }
            }
        };
        exporters.json.export(res);
    });


    app.get('/formView', (req, res) => {
        const tinyId = req.query.tinyId;
        const version = req.query.version;
        formByTinyIdVersion(tinyId, version, handleError({req, res}, cde => {
            if (isSearchEngine(req)) {
                res.render('bot/formView', 'system' as any, {elt: cde} as any);
            } else {
                respondHomeFull(req, res);
            }
        }));
    });

    app.post('/formCompletion/:term', nocacheMiddleware, (req, res) => {
        const term = req.params.term;
        completionSuggest(term, req.user, req.body, config.elastic.formSuggestIndex.name, (err, resp) => {
            if (err || !resp) {
                throw new Error('/formCompletion failed');
            }
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    // This is for tests only
    app.post('/sendMockFormData', (req, res) => {
        const mapping = JSON.parse(req.body.mapping);
        if (req.body['0-0'] === '1' && req.body['0-1'] === '2'
            && req.body['0-2'] === 'Lab Name'
            && req.body['0-3'] === 'FEMALE'
            && mapping.sections[0].questions[0].question === 'Number of CAG repeats on a larger allele'
            && mapping.sections[0].questions[0].name === '0-0'
            && mapping.sections[0].questions[0].ids[0].source === 'NINDS'
            && mapping.sections[0].questions[0].ids[0].id === 'C14936'
            && mapping.sections[0].questions[0].ids[0].version === '3'
            && mapping.sections[0].questions[0].ids[1].source === 'NINDS Variable Name'
            && mapping.sections[0].questions[0].ids[1].id === 'CAGRepeatsLargerAlleleNum'
            && mapping.sections[0].questions[0].tinyId === 'VTO0Feb6NSC'
            && mapping.sections[0].questions[1].tinyId === 'uw_koHkZ_JT'
            && mapping.sections[0].questions[2].question === 'Name of laboratory that performed this molecular study'
            && mapping.sections[0].questions[2].name === '0-2'
            && mapping.sections[0].questions[2].tinyId === 'EdUB2kWmV61'
            && mapping.sections[0].questions[3].name === '0-3'
            && mapping.sections[0].questions[3].tinyId === 'JWWpC2baVwK'
        ) {
            res.send('<html lang="en"><body>Form Submitted</body></html>');
        } else {
            res.status(401).send('<html lang="en"><body>Not the right input</body></html>');
        }
    });

    app.get('/schema/form', (req, res) => res.send((formModel as any).jsonSchema()));

    app.get('/ucumConvert', (req, res) => {
        const value = req.query.value === '0' ? 1e-20 : parseFloat(req.query.value); // 0 workaround
        const result = ucum.convertUnitTo(req.query.from, value, req.query.to);
        if (result.status === 'succeeded') {
            const ret = Math.abs(result.toVal) < 1 ? _.round(result.toVal, 10) : result.toVal; // 0 workaround
            res.send('' + ret);
        } else {
            res.send('');
        }
    });

    // cb(error, uom)
    function validateUom(uom, cb: CbErr<string>) {
        let error;
        const validation = ucum.validateUnitString(uom, true);
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
            const synonyms = ucum.checkSynonyms(uom);
            if (synonyms.status === 'succeeded' && synonyms.units.length) {
                synonyms.units.forEach(u => u.name === uom ? suggestions.push(u.code) : null);
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

    app.get('/ucumSynonyms', check('uom').isAlphanumeric(), validateBody, (req, res) => {
        const uom = req.query.uom;

        const resp = ucum.getSpecifiedUnit(uom, 'validate', 'false');
        if (!resp || !resp.unit) {
            return res.send([]);
        }

        const unit = resp.unit;
        const name = unit.name_;
        const synonyms = unit.synonyms_.split('; ');
        res.send([name, ...synonyms]);
    });

    app.get('/ucumNames', check('uom').isAlphanumeric(), validateBody, (req, res) => {
        const uom = req.query.uom;

        const resp = ucum.getSpecifiedUnit(uom, 'validate', true);
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

    app.post('/ucumValidate', check('uoms').isArray(), validateBody, (req, res) => {
        const errors: (string|undefined)[] = [];
        const units: (string|undefined)[] = [];
        req.body.uoms.forEach((uom, i) => {
            validateUom(uom, (error, u) => {
                errors[i] = error;
                units[i] = u;
                if (!errors[i] && uom !== units[i]) {
                    errors[i] = 'Unit ' + uom + ' found but needs to be replaced with ' + units[i];
                }
            });
            if (i > 0 && !errors[0] && !errors[i]) {
                const result = ucum.convertUnitTo(units[i], 1, units[0], true);
                if (result.status !== 'succeeded') {
                    errors[i] = 'Unit not compatible with first unit.' + (result.msg.length ? ' ' + result.msg[0] : '');
                }
            }
        });
        res.send({errors, units});
    });

    app.post('/syncLinkedForms', isOrgAuthorityMiddleware, (req, res) => {
        res.send();
        syncLinkedForms.syncLinkedForms();
    });

    app.get('/syncLinkedForms', (req, res) => res.send(syncLinkedForms.syncLinkedFormsProgress));

    /* tslint:disable */
    new CronJob('00 30 4 * * *', () => syncLinkedForms.syncLinkedForms(), null, true, 'America/New_York');
    /* tslint:enable */
}
