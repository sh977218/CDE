import * as Ajv from 'ajv';
import { Request, Response } from 'express';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
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
import { splitError, handleError, handleNotFound, respondError, handleErrorVoid } from 'server/errorHandler/errorHandler';
import { getFormNih } from 'server/form/nihForm';
import { getFormOdm } from 'server/form/odmForm';
import { getFormForPublishing } from 'server/form/publishForm';
import { formToSDC } from 'server/form/sdcForm';
import { orgByName } from 'server/orgManagement/orgDb';
import { badWorkingGroupStatus } from 'server/system/adminItemSvc';
import { checkOwnership, RequestWithItem } from 'server/system/authorization';
import { addFormToViewHistory, formatElt, sortArrayByArray } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { addFormIds, iterateFe, trimWholeForm } from 'shared/form/fe';
import { CdeForm } from 'shared/form/form.model';
import { formToQuestionnaire } from 'shared/mapping/fhir/to/toQuestionnaire';
import { CbError1, User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';

const ajv = new Ajv({schemaId: 'auto'}); // current FHIR schema uses legacy JSON Schema version 4
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
readdirSync(resolve(__dirname, '../../shared/mapping/fhir/assets/schema/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajv.addSchema(require('../../shared/mapping/fhir/assets/schema/' + file));
    }
});

function setResponseXmlHeader(res: Response) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Content-Type', 'application/xml');
}

export function fetchWholeForm(form: CdeForm, callback: CbError1<CdeForm>) {
    iterateFe(form,
        (f, cb, options) => {
            if (options.return.indexOf(f.inForm.form.tinyId) > -1) {
                cb(undefined, {skip: true});
                return;
            }
            formByTinyIdAndVersion(f.inForm.form.tinyId, f.inForm.form.version, (err, result) => {
                if (err || !result) {
                    cb(err || new Error('not found'));
                    return;
                }
                f.formElements = result.toObject().formElements;
                cb(undefined, {return: options.return.concat(f.inForm.form.tinyId)});
            });
        },
        undefined,
        undefined,
        err => callback(err || null, form),
        {return: [form.tinyId]}
    );
}

// callback(err, form)
// outdated is not necessary for endpoints by version
function fetchWholeFormOutdated(form: CdeForm, callback: CbError1<CdeForm>) {
    fetchWholeForm(form, splitError(callback, wholeForm => {
        if (!wholeForm) {
            callback(null, wholeForm);
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
        }, () => callback(null, wholeForm));
    }));
}

function wipeRenderDisallowed(form: CdeForm, user: User) {
    if (form && form.noRenderAllowed && !checkOwnership(form, user)) {
        form.formElements = [];
    }
}

export function byId(req: Request, res: Response) {
    const id = req.params.id;
    formById(id, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleNotFound({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            if (req.query.type === 'xml') {
                setResponseXmlHeader(res);
                if (req.query.subtype === 'odm') {
                    getFormOdm(wholeForm, handleError({req, res}, xmlForm => {
                        res.setHeader('Content-Type', 'text/xml');
                        return res.send(xmlForm);
                    }));
                } else if (req.query.subtype === 'sdc') {
                    formToSDC({
                        form: wholeForm,
                        renderer: req.query.renderer,
                        validate: req.query.validate
                    }, handleError({req, res}, sdcForm => res.send(sdcForm)));
                } else {
                    getFormNih(wholeForm, handleError({req, res}, xmlForm => res.send(xmlForm)));
                }
            } else {
                if (req.query.subtype === 'fhirQuestionnaire') {
                    addFormIds(wholeForm);
                    if (req.query.hasOwnProperty('validate')) {
                        const p = resolve(__dirname, '../../shared/mapping/fhir/assets/schema/Questionnaire.schema.json');
                        const data = readFileSync(p, 'utf8');
                        const result = ajv.validate(JSON.parse(data), formToQuestionnaire(wholeForm, null, config));
                        res.send({valid: result, errors: ajv.errors});
                    } else {
                        res.send(formToQuestionnaire(wholeForm, null, config));
                    }

                } else {
                    res.send(wholeForm);
                }
            }
            addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function priorForms(req: Request, res: Response) {
    const id = req.params.id;
    formById(id, handleNotFound({req, res}, form => {
        const history = form.history.concat([form._id]).reverse();
        formModel.find({}, {'updatedBy.username': 1, updated: 1, changeNote: 1, version: 1, elementType: 1})
            .where('_id').in(history).exec((err, priorForms) => {
            sortArrayByArray(priorForms, history);
            res.send(priorForms);
        });
    }));
}

export function byTinyId(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleNotFound(handlerOptions, form => {
        fetchWholeForm(form.toObject(), handleNotFound(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            if (req.query.type === 'xml') {
                setResponseXmlHeader(res);
                switch (req.query.subtype) {
                    case 'odm':
                        getFormOdm(wholeForm, handleError(handlerOptions, xmlForm => {
                            res.setHeader('Content-Type', 'text/xml');
                            return res.send(xmlForm);
                        }));
                        break;
                    case 'sdc':
                        formToSDC({
                            form: wholeForm,
                            renderer: req.query.renderer,
                            validate: req.query.validate
                        }, handleError({req, res}, sdcForm => {
                            res.send(sdcForm);
                        }));
                        break;
                    default:
                        getFormNih(wholeForm, handleError(handlerOptions, xmlForm => res.send(xmlForm)));
                }
            } else {
                res.send(wholeForm);
            }
            addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function byTinyIdAndVersion(req: Request, res: Response) {
    const {tinyId, version} = req.params;
    formByTinyIdAndVersion(tinyId, version, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleNotFound({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
}

export function draftForEditByTinyId(req: Request, res: Response) { // WORKAROUND: send empty instead of 404 because angular litters console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleError({req, res}, elt => {
        if (!elt || !canEditCuratedItem(req.user, elt)) {
            res.send();
            return;
        }
        (function getDraft() {
            draftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                if (elt._id.toString() !== draft._id.toString()) {
                    draftDelete(req);
                    return respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                }
                fetchWholeFormOutdated(draft.toObject(), handleError(handlerOptions, wholeForm =>
                    res.send(wholeForm)
                ));
            }));
        })();
    }));
}

export function forEditById(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const id = req.params.id;
    formById(id, handleNotFound(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleNotFound(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyId(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    formByTinyId(tinyId, handleNotFound(handlerOptions, form => {
        if (!form) {
            res.status(404).send();
            return;
        }
        fetchWholeFormOutdated(form.toObject(), handleNotFound(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            addFormToViewHistory(wholeForm, req.user);
        }));
    }));
}

export function forEditByTinyIdAndVersion(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    const version = req.params.version;
    formByTinyIdAndVersion(tinyId, version, handleNotFound(handlerOptions, form => {
        fetchWholeFormOutdated(form.toObject(), handleNotFound(handlerOptions, wholeForm => {
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

export function draftDelete(req: Request, res?: Response) {
    const tinyId = req.params.tinyId;
    formDraftDelete(tinyId, handleErrorVoid({req, res}, () => res && res.send()));
}

export function byTinyIdList(req: Request, res: Response) {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) {
        return res.status(400).send();
    }
    tinyIdList = tinyIdList.split(',');
    formByTinyIdList(tinyIdList, handleNotFound({req, res}, forms => {
        res.send(forms.map(formatElt));
    }));
}

export function latestVersionByTinyId(req: Request, res: Response) {
    const tinyId = req.params.tinyId;
    formLatestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => {
        res.send(latestVersion);
    }));
}

export function publishFormToHtml(req: Request, res: Response) {
    if (!req.params.id || req.params.id.length !== 24) {
        return res.status(400).send();
    }
    formById(req.params.id, handleNotFound({req, res}, form => {
        fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            getFormForPublishing(wholeForm, req, res);
        }));
    }));
}

export function create(req: Request, res: Response) {
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
    orgByName(eltToArchive.stewardOrg.name || '', handleNotFound(handlerOptions, org => {
        if (badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        trimWholeForm(draft);

        update(draft, req.user, options, handleNotFound(handlerOptions, doc => {
            formDraftDelete(draft.tinyId, handleErrorVoid(handlerOptions, () => res.send(doc)));
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

export function originalSourceByTinyIdSourceName(req: Request, res: Response) {
    const tinyId = req.params.tinyId;
    const sourceName = req.params.sourceName;
    formOriginalSourceByTinyIdSourceName(tinyId, sourceName, handleNotFound({req, res}, originalSource => {
        res.send(originalSource);
    }));
}

export function viewHistory(req: Request, res: Response) {
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
