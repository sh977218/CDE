import * as Ajv from 'ajv';
import { Request, Response } from 'express';
import { byTinyIdList as deByTinyIdList, dataElementModel } from 'server/cde/mongo-cde';
import {
    byId as formById, byTinyId as formByTinyId, byTinyIdList as formByTinyIdList,
    byTinyIdAndVersion as formByTinyIdAndVersion,
    create as formCreate, draftById, draftByTinyId, draftDelete as formDraftDelete, draftSave as formDraftSave,
    formModel,
    latestVersionByTinyId as formLatestVersionByTinyId,
    originalSourceByTinyIdSourceName as formOriginalSourceByTinyIdSourceName, update,
    CdeFormDraft, byTinyIdListInOrder
} from 'server/form/mongo-form';
import { splitError, handleError, handleNotFound, respondError } from 'server/errorHandler/errorHandler';
import { RequestWithItem } from 'server/system/authorization';
import { config } from 'server/system/parseConfig';
import { addFormIds, iterateFe, trimWholeForm } from 'shared/form/fe';
import { CdeForm } from 'shared/form/form.model';
import { formToQuestionnaire } from 'shared/mapping/fhir/to/toQuestionnaire';
import { CbError } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';
import { orgByName } from 'server/orgManagement/orgDb';

const fs = require('fs');
const path = require('path');
const adminItemSvc = require('../system/adminItemSvc');
const authorization = require('../system/authorization');
const mongoData = require('../system/mongo-data');
const nih = require('./nihForm');
const sdc = require('./sdcForm');
const odm = require('./odmForm');
const publishForm = require('./publishForm');

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

export function fetchWholeForm(form: CdeForm, callback: CbError<CdeForm>) {
    iterateFe(form,
        (f, cb, options) => {
            if (options.return.indexOf(f.inForm.form.tinyId) > -1) {
                cb(undefined, {skip: true});
                return;
            }
            formByTinyIdAndVersion(f.inForm.form.tinyId, f.inForm.form.version, (err, result) => {
                if (err) {
                    cb(err);
                    return;
                }
                f.formElements = result.toObject().formElements;
                cb(undefined, {return: options.return.concat(f.inForm.form.tinyId)});
            });
        },
        undefined,
        undefined,
        err => callback(err, form),
        {return: [form.tinyId]}
    );
}

// callback(err, form)
// outdated is not necessary for endpoints by version
function fetchWholeFormOutdated(form: CdeForm, callback: CbError<CdeForm>) {
    fetchWholeForm(form, splitError(callback, wholeForm => {
        if (!wholeForm) {
            callback(undefined, wholeForm);
            return;
        }
        iterateFe(wholeForm, (f, cb) => {
            formModel.findOne({tinyId: f.inForm.form.tinyId, archived: false}, {version: 1}, (err, elt) => {
                if (elt && (f.inForm.form.version || null) !== (elt.version || null)) {
                    f.inForm.form.outdated = true;
                    wholeForm.outdated = true;
                }
                cb(err, {skip: true});
            });
        }, undefined, (q, cb) => {
            dataElementModel.findOne({
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
    }));
}

function wipeRenderDisallowed(form, user) {
    if (form && form.noRenderAllowed && !authorization.checkOwnership(form, user)) {
        form.formElements = [];
    }
}

export function byId(req, res) {
    const id = req.params.id;
    formById(id, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleNotFound({req, res}, wholeForm => {
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
                    }, handleError({req, res}, sdcForm => res.send(sdcForm)));
                } else {
                    nih.getFormNih(wholeForm, handleError({req, res}, xmlForm => res.send(xmlForm)));
                }
            } else {
                if (req.query.subtype === 'fhirQuestionnaire') {
                    addFormIds(wholeForm);
                    if (req.query.hasOwnProperty('validate')) {
                        const p = path.resolve(__dirname, '../../shared/mapping/fhir/assets/schema/Questionnaire.schema.json');
                        const data = fs.readFileSync(p);
                        const result = ajv.validate(JSON.parse(data), formToQuestionnaire(wholeForm, null, config));
                        res.send({valid: result, errors: ajv.errors});
                    } else {
                        res.send(formToQuestionnaire(wholeForm, null, config));
                    }

                } else {
                    res.send(wholeForm);
                }
            }
            mongoData.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function priorForms(req, res) {
    const id = req.params.id;
    formById(id, handleNotFound({req, res}, form => {
        const history = form.history.concat([form._id]).reverse();
        formModel.find({}, {'updatedBy.username': 1, updated: 1, changeNote: 1, version: 1, elementType: 1})
            .where('_id').in(history).exec((err, priorForms) => {
            mongoData.sortArrayByArray(priorForms, history);
            res.send(priorForms);
        });
    }));
}

export function byTinyId(req, res) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleNotFound(handlerOptions, form => {
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
                        }, handleError({req, res}, sdcForm => {
                            res.send(sdcForm);
                        }));
                        break;
                    default:
                        nih.getFormNih(wholeForm, handleError(handlerOptions, xmlForm => res.send(xmlForm)));
                }
            } else {
                res.send(wholeForm);
            }
            mongoData.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function byTinyIdAndVersion(req, res) {
    const {tinyId, version} = req.params;
    formByTinyIdAndVersion(tinyId, version, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function draftForEditByTinyId(req, res) { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleError({req, res}, elt => {
        if (!canEditCuratedItem(req.user, elt) || !elt) {
            res.send();
            return;
        }
        (function getDraft() {
            draftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                if (elt._id.toString() !== draft._id.toString()) {
                    draftDelete(tinyId, handleError(handlerOptions, getDraft));
                    return respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                }
                fetchWholeFormOutdated(draft.toObject(), handleError(handlerOptions, wholeForm =>
                    res.send(wholeForm)
                ));
            }));
        })();
    }));
}

export function forEditById(req, res) {
    const handlerOptions = {req, res};
    const id = req.params.id;
    formById(id, handleNotFound(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongoData.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyId(req, res) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleNotFound(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongoData.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyIdAndVersion(req, res) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    const version = req.params.version;
    formByTinyIdAndVersion(tinyId, version, handleNotFound(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function draftSave(req: RequestWithItem, res: Response) {
    const elt = req.body;
    const tinyId = req.params.tinyId;
    if (!elt || elt.tinyId !== tinyId || elt._id !== req.item._id.toString()) {
        return res.status(400).send();
    }
    formDraftSave(elt, req.user, handleError({req, res}, elt => {
        if (!elt) {
            return res.status(409).send('Edited by someone else. Please refresh and redo.');
        }
        res.send(elt);
    }));
}

export function draftDelete(req, res) {
    const tinyId = req.params.tinyId;
    formDraftDelete(tinyId, handleError({req, res}, () => res.send()));
}

export function byTinyIdList(req, res) {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) {
        return res.status(400).send();
    }
    tinyIdList = tinyIdList.split(',');
    formByTinyIdList(tinyIdList, handleNotFound({req, res}, forms => {
        res.send(forms.map(mongoData.formatElt));
    }));
}

export function latestVersionByTinyId(req, res) {
    const tinyId = req.params.tinyId;
    formLatestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => {
        res.send(latestVersion);
    }));
}

export function publishFormToHtml(req, res) {
    if (!req.params.id || req.params.id.length !== 24) {
        return res.status(400).send();
    }
    formById(req.params.id, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            publishForm.getFormForPublishing(wholeForm, req, res);
        }));
    }));
}

export function create(req, res) {
    const elt = req.body;
    const user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) {
        return res.status(400).send();
    }
    formCreate(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req: RequestWithItem, res: Response, draft: CdeFormDraft, options = {}) {
    const handlerOptions = {req, res};
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    orgByName(eltToArchive.stewardOrg.name, handleError(handlerOptions, org => {
        if (adminItemSvc.badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        trimWholeForm(draft);

        update(draft, req.user, options, handleNotFound(handlerOptions, doc => {
            formDraftDelete(draft.tinyId, handleError(handlerOptions, () => res.send(doc)));
        }));
    }));
}

export function publishFromDraft(req: RequestWithItem, res: Response) {
    draftById(req.body._id, handleNotFound({req, res}, draft => {
        if (draft.__v !== req.body.__v) {
            return res.status(400).send('Cannot publish this old version. Reload and redo.');
        }
        publish(req, res, draft.toObject(), {
            updateAttachments: true,
            classification: true
        });
    }));
}

export function publishExternal(req: RequestWithItem, res: Response) {
    draftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
}

export function originalSourceByTinyIdSourceName(req, res) {
    const tinyId = req.params.tinyId;
    const sourceName = req.params.sourceName;
    formOriginalSourceByTinyIdSourceName(tinyId, sourceName, handleNotFound({req, res}, originalSource => {
        res.send(originalSource);
    }));
}

export function viewHistory(req, res) {
    const splicedArray = req.user.formViewHistory.splice(0, 10);
    const idList: string[] = [];
    for (const sa of splicedArray) {
        if (idList.indexOf(sa) === -1) {
            idList.push(sa);
        }
    }
    byTinyIdListInOrder(idList, (err, forms) => {
        res.send(forms);
    });
}
