import * as Ajv from 'ajv';
import { Request, Response } from 'express';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { config, dbPlugins } from 'server';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    create as formCreate, draftById, draftByTinyId, draftDelete as formDraftDelete, draftSave as formDraftSave,
    formModel,
    originalSourceByTinyIdSourceName as formOriginalSourceByTinyIdSourceName, update,
    CdeFormDraft
} from 'server/form/mongo-form';
import { splitError, handleError, handleNotFound, respondError, handleErrorVoid } from 'server/errorHandler/errorHandler';
import { getFormNih } from 'server/form/nihForm';
import { getFormOdm } from 'server/form/odmForm';
import { getFormForPublishing } from 'server/form/publishForm';
import { formToSDC } from 'server/form/sdcForm';
import { orgByName } from 'server/orgManagement/orgDb';
import { badWorkingGroupStatus } from 'server/system/adminItemSvc';
import { RequestWithItem } from 'server/system/authorization';
import { addFormToViewHistory, sortArrayByArray } from 'server/system/mongo-data';
import { addFormIds, iterateFe, trimWholeForm } from 'shared/form/fe';
import { CdeForm } from 'shared/form/form.model';
import { formToQuestionnaire } from 'shared/mapping/fhir/to/toQuestionnaire';
import { CbError1, User } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/security/authorizationShared';

const ajv = new Ajv({schemaId: 'auto'}); // current FHIR schema uses legacy JSON Schema version 4
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
readdirSync(resolve(global.assetDir('shared/mapping/fhir/assets/schema/'))).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajv.addSchema(require(global.assetDir('shared/mapping/fhir/assets/schema/', file)));
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
            dbPlugins.form.byTinyIdAndVersion(f.inForm.form.tinyId, f.inForm.form.version)
                .then(item => {
                /* istanbul ignore if */
                if (!item) {
                    cb(new Error('not found'));
                    return;
                }
                f.formElements = item.formElements;
                cb(undefined, {return: options.return.concat(f.inForm.form.tinyId)});
            }, cb);
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
        /* istanbul ignore if */
        if (!wholeForm) {
            callback(null, wholeForm);
            return;
        }
        iterateFe(wholeForm, (f, cb) => {
            formModel.findOne({tinyId: f.inForm.form.tinyId, archived: false}, {version: 1}, null, (err, elt) => {
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
            }, {version: 1}, null, (err, elt) => {
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
    if (form && form.noRenderAllowed && !canEditCuratedItem(user, form)) {
        form.formElements = [];
    }
}

export function byId(req: Request, res: Response) {
    const id = req.params.id;
    return dbPlugins.form.byId(id).then(form => {
        if (!form) {
            return res.status(404).send();
        }
        fetchWholeForm(form, handleNotFound({req, res}, wholeForm => {
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
                        renderer: req.query.renderer as 'defaultHtml' | undefined,
                        validate: req.query.validate as string
                    }, handleError({req, res}, sdcForm => res.send(sdcForm)));
                } else {
                    getFormNih(wholeForm, handleError({req, res}, xmlForm => res.send(xmlForm)));
                }
            } else {
                if (req.query.subtype === 'fhirQuestionnaire') {
                    addFormIds(wholeForm);
                    if (req.query.hasOwnProperty('validate')) {
                        const p = resolve(global.assetDir('shared/mapping/fhir/assets/schema/Questionnaire.schema.json'));
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
    }, respondError({req, res}));
}

export function priorForms(req: Request, res: Response) {
    const id = req.params.id;
    return dbPlugins.form.byId(id).then(form => {
        if (!form) {
            return res.status(404).send();
        }
        const history = form.history.concat([form._id]).reverse();
        formModel.find({}, {'updatedBy.username': 1, updated: 1, changeNote: 1, version: 1, elementType: 1})
            .where('_id').in(history).exec((err, priorForms) => {
            sortArrayByArray(priorForms, history);
            res.send(priorForms);
        });
    }, respondError({req, res}));
}

export function byTinyId(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    return dbPlugins.form.byTinyId(tinyId).then(form => {
        if (!form) {
            return res.status(404).send();
        }
        fetchWholeForm(form, handleNotFound(handlerOptions, wholeForm => {
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
                            renderer: req.query.renderer as 'defaultHtml' | undefined,
                            validate: req.query.validate as string,
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
    }, respondError(handlerOptions));
}

export function byTinyIdAndVersion(req: Request, res: Response) {
    const {tinyId, version} = req.params;
    return dbPlugins.form.byTinyIdAndVersion(tinyId, version)
        .then(form => {
            if (!form) {
                return res.status(404).send();
            }
            fetchWholeForm(form, handleNotFound({req, res}, wholeForm => {
                wipeRenderDisallowed(wholeForm, req.user);
                res.send(wholeForm);
            }));
        }, respondError({req, res}));
}

export function draftForEditByTinyId(req: Request, res: Response) { // WORKAROUND: send empty instead of 404 because angular litters console
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    return dbPlugins.form.byTinyId(tinyId).then(elt => {
        if (!elt || !canEditCuratedItem(req.user, elt)) {
            return res.send();
        }
        (function getDraft() {
            draftByTinyId(tinyId, handleError(handlerOptions, draft => {
                if (!draft) {
                    return res.send();
                }
                /* istanbul ignore if */
                if (elt._id.toString() !== draft._id.toString()) {
                    draftDelete(req);
                    return respondError(new Error('Concurrency Error: Draft of prior elt should not exist'));
                }
                fetchWholeFormOutdated(draft.toObject(), handleError(handlerOptions, wholeForm =>
                    res.send(wholeForm)
                ));
            }));
        })();
    }, respondError({req, res}));
}

export function forEditById(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const id = req.params.id;
    return dbPlugins.form.byId(id).then(form => {
        if (!form) {
            return res.status(404).send();
        }
        fetchWholeFormOutdated(form, handleNotFound(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            addFormToViewHistory(wholeForm, req.user);
        }));
    }, respondError(handlerOptions));
}

export function forEditByTinyId(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    return dbPlugins.form.byTinyId(tinyId).then(form => {
        /* istanbul ignore if */
        if (!form) {
            return res.status(404).send();
        }
        fetchWholeFormOutdated(form, handleNotFound(handlerOptions, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            addFormToViewHistory(wholeForm, req.user);
        }));
    }, respondError(handlerOptions));
}

export function forEditByTinyIdAndVersion(req: Request, res: Response) {
    const handlerOptions = {req, res};
    const tinyId = req.params.tinyId;
    const version = req.params.version;
    dbPlugins.form.byTinyIdAndVersion(tinyId, version)
        .then(form => {
            if (!form) {
                return res.status(404).send();
            }
            fetchWholeFormOutdated(form, handleNotFound(handlerOptions, wholeForm => {
                wipeRenderDisallowed(wholeForm, req.user);
                res.send(wholeForm);
            }));
        }, respondError(handlerOptions));
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
    formDraftDelete(tinyId).then(() => res && res.send(), respondError({req, res}));
}

export function byTinyIdList(req: Request, res: Response): Promise<Response> {
    /* istanbul ignore if */
    if (!req.params.tinyIdList) {
        return Promise.resolve(res.status(400).send());
    }
    return dbPlugins.form.byTinyIdListElastic(req.params.tinyIdList.split(','))
        .then(forms => res.send(forms), respondError({req, res}));
}

export function latestVersionByTinyId(req: Request, res: Response): Promise<Response> {
    return dbPlugins.form.versionByTinyId(req.params.tinyId)
        .then(version => res.send(version), respondError({req, res}));
}

export function publishFormToHtml(req: Request, res: Response) {
    /* istanbul ignore if */
    if (!req.params.id || req.params.id.length !== 24) {
        return res.status(400).send();
    }
    return dbPlugins.form.byId(req.params.id).then(form => {
        if (!form) {
            return res.status(404).send();
        }
        fetchWholeForm(form, handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            getFormForPublishing(wholeForm, req, res);
        }));
    }, respondError({req, res}));
}

export function create(req: Request, res: Response) {
    const elt = req.body;
    const user = req.user;
    /* istanbul ignore if */
    if (!elt.stewardOrg || !elt.stewardOrg.name) {
        return res.status(400).send();
    }
    formCreate(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
}

function publish(req: RequestWithItem, res: Response, draft: CdeFormDraft, options = {}) {
    const handlerOptions = {req, res};
    /* istanbul ignore if */
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    orgByName(eltToArchive.stewardOrg.name).then(org => {
        if (!org) {
            return res.status(404).send();
        }
        if (badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }
        trimWholeForm(draft);
        update(draft, req.user, options, handleNotFound(handlerOptions, doc => {
            formDraftDelete(draft.tinyId).then(() => res.send(doc), respondError(handlerOptions));
        }));
    }, respondError(handlerOptions));
}

export function publishFromDraft(req: RequestWithItem, res: Response) {
    draftById(req.body._id, handleNotFound({req, res}, draft => {
        /* istanbul ignore if */
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
        /* istanbul ignore if */
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

export function viewHistory(req: Request, res: Response): Promise<Response> {
    const splicedArray = req.user.formViewHistory.splice(0, 10);
    const idList: string[] = [];
    for (const sa of splicedArray) {
        if (idList.indexOf(sa) === -1) {
            idList.push(sa);
        }
    }
    return dbPlugins.form.byTinyIdListElastic(idList)
        .then(forms => res.send(forms), respondError({req, res}));
}
