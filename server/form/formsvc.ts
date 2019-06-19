import { addFormIds, iterateFe, trimWholeForm } from '../../shared/form/fe';
import { formToQuestionnaire } from '../../shared/mapping/fhir/to/toQuestionnaire';
import { canEditCuratedItem } from '../../shared/system/authorizationShared';
import { handle404, handleError, respondError } from '../../server/errorHandler/errHandler';
import { config } from '../../server/system/parseConfig';

const Ajv = require('ajv');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const mongo_cde = require('../cde/mongo-cde');
const adminItemSvc = require('../system/adminItemSvc');
const authorization = require('../system/authorization');
const mongo_data = require('../system/mongo-data');
const mongo_form = require('./mongo-form');
const nih = require('./nihForm');
const sdc = require('./sdcForm');
const odm = require('./odmForm');
const publishForm = require('./publishForm');
const elastic = require('../system/elastic');

const ajv = new Ajv({schemaId: 'auto'}); // current FHIR schema uses legacy JSON Schema version 4
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
fs.readdirSync(path.resolve(__dirname, '../../shared/mapping/fhir/assets/schema/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajv.addSchema(require('../../shared/mapping/fhir/assets/schema/' + file));
    }
});

function setResponseXmlHeader(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Content-Type', 'application/xml');
}

// callback(err, form)
export function fetchWholeForm(form, callback) {
    iterateFe(form,
        (f, cb, options) => {
            if (options.return.indexOf(f.inForm.form.tinyId) > -1) {
                cb(undefined, {skip: true});
                return;
            }
            mongo_form.byTinyIdAndVersion(f.inForm.form.tinyId, f.inForm.form.version, function (err, result) {
                if (err) {
                    cb('Retrieving form tinyId: ' + f.inForm.form.tinyId + ' version: ' + f.inForm.form.version
                        + ' has error: ' + err);
                    return;
                }
                f.formElements = result.toObject().formElements;
                cb(undefined, {return: options.return.concat(f.inForm.form.tinyId)});
            });
        },
        undefined,
        undefined,
        err =>
            callback(err, form),
        {return: [form.tinyId]}
    );
}

// callback(err, form)
// outdated is not necessary for endpoints by version
function fetchWholeFormOutdated(form, callback) {
    fetchWholeForm(form, function (err, wholeForm) {
        if (err) {
            callback(err);
            return;
        }
        iterateFe(wholeForm, (f, cb) => {
            mongo_form.Form.findOne({tinyId: f.inForm.form.tinyId, archived: false}, {version: 1}, (err, elt) => {
                if (elt && (f.inForm.form.version || null) !== (elt.version || null)) {
                    f.inForm.form.outdated = true;
                    wholeForm.outdated = true;
                }
                cb(err, {skip: true});
            });
        }, undefined, (q, cb) => {
            mongo_cde.DataElement.findOne({
                tinyId: q.question.cde.tinyId,
                archived: false
            }, {version: 1}, (err, elt) => {
                if (elt && (q.question.cde.version || null) !== (elt.version || null)) {
                    q.question.cde.outdated = true;
                    wholeForm.outdated = true;
                }
                cb(err);
            });
        }, () => callback(undefined, wholeForm));
    });
}

function wipeRenderDisallowed(form, user) {
    if (form && form.noRenderAllowed && !authorization.checkOwnership(form, user)) {
        form.formElements = [];
    }
}

export function byId(req, res) {
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            if (req.query.type === 'xml') {
                setResponseXmlHeader(res);
                if (req.query.subtype === 'odm') {
                    odm.getFormOdm(wholeForm, handleError({req, res}, xmlForm => {
                        res.setHeader('Content-Type', 'text/xml');
                        return res.send(xmlForm);
                    }));
                } else if (req.query.subtype === 'sdc') {
                    sdc.formToSDC({
                        form: wholeForm,
                        renderer: req.query.renderer,
                        validate: req.query.validate
                    }, (err, sdcForm) => {
                        if (err) return res.send(err);
                        return res.send(sdcForm);
                    });
                } else {
                    nih.getFormNih(wholeForm, handleError({req, res}, xmlForm => res.send(xmlForm)));
                }
            } else {
                if (req.query.subtype === 'fhirQuestionnaire') {
                    addFormIds(wholeForm);
                    if (req.query.hasOwnProperty('validate')) {
                        let p = path.resolve(__dirname, '../../shared/mapping/fhir/assets/schema/Questionnaire.schema.json');
                        fs.readFile(p, (err, data) => {
                            if (err || !data) return respondError(err, {
                                res,
                                publicMessage: 'schema missing',
                                origin: 'formsvc'
                            });
                            let result = ajv.validate(JSON.parse(data),
                                formToQuestionnaire(wholeForm, null, config));
                            res.send({valid: result, errors: ajv.errors});
                        });
                    } else {
                        res.send(formToQuestionnaire(wholeForm, null, config));
                    }

                } else {
                    res.send(wholeForm);
                }
            }
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function priorForms(req, res) {
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404({req, res}, form => {
        let history = form.history.concat([form._id]).reverse();
        mongo_form.Form.find({}, {'updatedBy.username': 1, updated: 1, 'changeNote': 1, version: 1, elementType: 1})
            .where('_id').in(history).exec((err, priorForms) => {
            mongo_data.sortArrayByArray(priorForms, history);
            res.send(priorForms);
        });
    }));
}

export function byTinyId(req, res) {
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handle404(handlerOptions, form => {
        fetchWholeForm(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            if (req.query.type === 'xml') {
                setResponseXmlHeader(res);
                switch (req.query.subtype) {
                    case 'odm':
                        odm.getFormOdm(wholeForm, handleError(handlerOptions, xmlForm => {
                            res.setHeader('Content-Type', 'text/xml');
                            return res.send(xmlForm);
                        }));
                        break;
                    case 'sdc':
                        sdc.formToSDC({
                            form: wholeForm,
                            renderer: req.query.renderer,
                            validate: req.query.validate
                        }, (err, sdcForm) => {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                        break;
                    default:
                        nih.getFormNih(wholeForm, handleError(handlerOptions, xmlForm => res.send(xmlForm)));
                }
            } else {
                res.send(wholeForm);
            }
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function byTinyIdVersion(req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, handle404({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function byTinyIdAndVersion(req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, handle404({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function draftForEditByTinyId(req, res) { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handleError({req, res}, elt => {
        if (!canEditCuratedItem(req.user, elt)) {
            res.send();
            return;
        }
        (function getDraft() {
            mongo_form.draftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                if (elt._id.toString() !== draft._id.toString()) {
                    mongo_form.draftDelete(tinyId, handleError(handlerOptions, () =>
                        getDraft()
                    ));
                    respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                    return;
                }
                fetchWholeFormOutdated(draft.toObject(), handleError(handlerOptions, wholeForm =>
                    res.send(wholeForm)
                ));
            }));
        })();
    }));
}

export function draftForEditById(req, res) {
    const handlerOptions = {req, res};
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.draftById(id, handleError(handlerOptions, form => {
        if (!form) return res.send();
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => res.send(wholeForm)));
    }));
}

export function forEditById(req, res) {
    const handlerOptions = {req, res};
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyId(req, res) {
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handle404(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyIdAndVersion(req, res) {
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, handle404(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function draftSave(req, res) {
    let elt = req.body;
    let tinyId = req.params.tinyId;
    if (!elt || !tinyId || elt.tinyId !== tinyId || elt._id !== req.item._id.toString()) {
        return res.status(400).send();
    }
    mongo_form.draftSave(elt, req.user, handleError({req, res}, elt => {
        if (!elt) {
            res.status(409).send('Edited by someone else. Please refresh and redo.');
            return;
        }
        res.send(elt);
    }));
}

export function draftDelete(req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.draftDelete(tinyId, handleError({req, res}, () => res.send()));
}

export function byTinyIdList(req, res) {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) return res.status(400).send();
    tinyIdList = tinyIdList.split(',');
    mongo_form.byTinyIdList(tinyIdList, handleError({req, res}, forms => {
        res.send(forms.map(mongo_data.formatElt));
    }));
}

export function latestVersionByTinyId(req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => {
        res.send(latestVersion);
    }));
}

export function publishFormToHtml(req, res) {
    if (!req.params.id || req.params.id.length !== 24) return res.status(400).send();
    mongo_form.byId(req.params.id, handle404({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            publishForm.getFormForPublishing(wholeForm, req, res);
        }));
    }));
}

export function create(req, res) {
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) return res.status(400).send();
    mongo_form.create(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req, res, draft, options = {}) {
    const handlerOptions = {req, res};
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    mongo_data.orgByName(eltToArchive.stewardOrg.name, handleError(handlerOptions, org => {
        if (adminItemSvc.badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        trimWholeForm(draft);

        mongo_form.update(draft, req.user, options, handle404(handlerOptions, doc => {
            mongo_form.draftDelete(draft.tinyId, handleError(handlerOptions, () => res.send(doc)));
        }));
    }));
}

export function publishFromDraft(req, res) {
    mongo_form.draftById(req.body._id, handle404({req, res}, draft => {
        if (draft.__v !== req.body.__v) {
            return res.status(400).send('Cannot publish this old version. Reload and redo.');
        }
        publish(req, res, draft.toObject(), {
            updateAttachments: true,
            classification: true
        });
    }));
}

export function publishExternal(req, res) {
    mongo_form.draftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
}

export function originalSourceByTinyIdSourceName(req, res) {
    let tinyId = req.params.tinyId;
    let sourceName = req.params.sourceName;
    mongo_form.originalSourceByTinyIdSourceName(tinyId, sourceName, handle404({req, res}, originalSource => {
        res.send(originalSource);
    }));
}

export let syncLinkedFormsProgress: any = {done: 0, total: 0};

export async function syncLinkedForms() {
    let t0 = Date.now();
    syncLinkedFormsProgress = {done: 0, total: 0};
    const cdeCursor = mongo_cde.getStream({archived: false});
    syncLinkedFormsProgress.total = await mongo_cde.count({archived: false});
    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        let esResult = await elastic.esClient.search({
            index: config.elastic.formIndex.name,
            q: cde.tinyId,
            size: 200
        });

        const linkedForms = {
            "Retired": 0,
            "Incomplete": 0,
            "Candidate": 0,
            "Recorded": 0,
            "Qualified": 0,
            "Standard": 0,
            "Preferred Standard": 0,
            "forms": []
        };

        esResult.hits.hits.forEach(h => {
            linkedForms.forms.push({
                tinyId: h._source.tinyId,
                registrationStatus: h._source.registrationState.registrationStatus,
                primaryName: h._source.primaryNameCopy
            });
            linkedForms[h._source.registrationState.registrationStatus]++;
        });

        linkedForms.Standard += linkedForms["Preferred Standard"];
        linkedForms.Qualified += linkedForms.Standard;
        linkedForms.Recorded += linkedForms.Qualified;
        linkedForms.Candidate += linkedForms.Recorded;
        linkedForms.Incomplete += linkedForms.Candidate;
        linkedForms.Retired += linkedForms.Incomplete;

        elastic.esClient.update({
            index: config.elastic.index.name,
            type: "dataelement",
            id: cde.tinyId,
            body: {doc: {linkedForms: linkedForms}}
        });
        syncLinkedFormsProgress.done++;
    }
    syncLinkedFormsProgress.timeTaken = Date.now() - t0;
}
