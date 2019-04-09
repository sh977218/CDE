const Ajv = require('ajv');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const formShared = require('esm')(module)('../../shared/form/fe');
const toQuestionnaire = require('esm')(module)('../../shared/mapping/fhir/to/toQuestionnaire');
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const mongo_cde = require('../cde/mongo-cde');
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const respondError = dbLogger.respondError;
const adminItemSvc = require('../system/adminItemSvc.js');
const authorization = require('../system/authorization');
const mongo_data = require('../system/mongo-data');
const config = require('../system/parseConfig');
const mongo_form = require('./mongo-form');
const nih = require('./nihForm');
const sdc = require('./sdcForm');
const odm = require('./odmForm');
const redCap = require('./redCapForm');
const publishForm = require('./publishForm');
const elastic = require('../system/elastic.js');

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
exports.fetchWholeForm = function (form, callback) {
    formShared.iterateFe(form,
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
};

// callback(err, form)
// outdated is not necessary for endpoints by version
function fetchWholeFormOutdated(form, callback) {
    exports.fetchWholeForm(form, function (err, wholeForm) {
        if (err) {
            callback(err);
            return;
        }
        formShared.iterateFe(wholeForm, (f, cb) => {
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

function doSection(sFormElement) {
    let formElements = [];
    for (let fe of sFormElement.formElements) {
        if (fe.elementType === 'question') {
            formElements.push(fe);
        } else {
            let questions = doSection(fe);
            formElements = formElements.concat(questions);
        }
    }
    return formElements;
}

/*
|---------------|           |---------------|
|   S1          |           |   S1          |
|       Q1      |           |       Q1      |
|       Q11      |          |       Q11     |
|       S2      |           |   S1-S2       |
|           Q2  |    ==>    |       Q2      |
|   Q3          |           |   S3(new)     |
|               |           |       Q3      |
|   S4          |           |   S4          |
|       Q4      |           |       Q4      |
|---------------|           |---------------|
*/
function oneLayerForm(form) {
    let formElements = [];
    let newSection = {
        elementType: 'section',
        label: '',
        formElements: []
    };
    for (let formElement of form.formElements) {
        let type = formElement.elementType;
        if (type === 'question') {
            newSection.formElements.push(formElement);
        } else {
            if (newSection.formElements.length > 0) {
                formElements.push(newSection);
                newSection = {
                    elementType: 'section',
                    label: '',
                    formElements: []
                };
            }
            let questions = doSection(formElement);
            formElement.formElements = questions;
            formElements.push(formElement);
        }
    }
    form.formElements = formElements;
}

exports.byId = (req, res) => {
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
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
            } else if (req.query.type && req.query.type.toLowerCase() === 'redcap') {
                oneLayerForm(wholeForm, 0);
                redCap.getZipRedCap(wholeForm, res);
            } else {
                if (req.query.subtype === 'fhirQuestionnaire') {
                    formShared.addFormIds(wholeForm);
                    if (req.query.hasOwnProperty('validate')) {
                        let p = path.resolve(__dirname, '../../shared/mapping/fhir/assets/schema/Questionnaire.schema.json');
                        fs.readFile(p, (err, data) => {
                            if (err || !data) return respondError(err, {
                                res,
                                publicMessage: 'schema missing',
                                origin: 'formsvc'
                            });
                            let result = ajv.validate(JSON.parse(data),
                                toQuestionnaire.formToQuestionnaire(wholeForm, null, config));
                            res.send({valid: result, errors: ajv.errors});
                        });
                    } else {
                        res.send(toQuestionnaire.formToQuestionnaire(wholeForm, null, config));
                    }

                } else {
                    res.send(wholeForm);
                }
            }
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
};

exports.priorForms = (req, res) => {
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
};

exports.byTinyId = (req, res) => {
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handle404(handlerOptions, form => {
        exports.fetchWholeForm(form.toObject(), handleError(handlerOptions, wholeForm => {
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
            } else if (req.query.type && req.query.type.toLowerCase() === 'redcap') {
                dbLogger.consoleLog('faas: ' + config.provider.faas, global.CURRENT_SERVER_ENV);
                switch (config.provider.faas) {
                    case 'AWS':
                        const AWS = require('aws-sdk');
                        if (!global.CURRENT_SERVER_ENV) {
                            throw new Error('ENV not ready');
                        }
                        // test error: xmlStr = xmlStr.replace(/<List>.*<\/List>/g, '');
                        let jsonPayload = {
                            input: wholeForm
                        };
                        let params = {
                            FunctionName: config.cloudFunction.zipExport.name + '-' + global.CURRENT_SERVER_ENV,
                            Payload: JSON.stringify(jsonPayload)
                        };

                        new AWS.Lambda({region: 'us-east-1'}).invoke(params, (err, result) => {

                        });
                        break;
                    case 'ON_PREM':
                        redCap.getZipRedCap(wholeForm, res);
                        break;
                    default:
                        throw new Error('not supported');
                }
            } else {
                res.send(wholeForm);
            }
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
};

exports.byTinyIdVersion = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
};

exports.byTinyIdAndVersion = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
};

exports.draftForEditByTinyId = (req, res) => { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handleError({req, res}, elt => {
        if (!authorizationShared.canEditCuratedItem(req.user, elt)) {
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
};

exports.draftForEditById = (req, res) => {
    const handlerOptions = {req, res};
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.draftById(id, handleError(handlerOptions, form => {
        if (!form) return res.send();
        fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm => res.send(wholeForm)));
    }));
};

exports.forEditById = (req, res) => {
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
};

exports.forEditByTinyId = (req, res) => {
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
};

exports.forEditByTinyIdAndVersion = (req, res) => {
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
};

exports.draftSave = (req, res) => {
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
};

exports.draftDelete = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.draftDelete(tinyId, handleError({req, res}, () => res.send()));
};

exports.byTinyIdList = (req, res) => {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) return res.status(400).send();
    tinyIdList = tinyIdList.split(',');
    mongo_form.byTinyIdList(tinyIdList, handleError({req, res}, forms => {
        res.send(forms.map(mongo_data.formatElt));
    }));
};

exports.latestVersionByTinyId = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => {
        res.send(latestVersion);
    }));
};

exports.publishFormToHtml = (req, res) => {
    if (!req.params.id || req.params.id.length !== 24) return res.status(400).send();
    mongo_form.byId(req.params.id, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            publishForm.getFormForPublishing(wholeForm, req, res);
        }));
    }));
};

exports.create = (req, res) => {
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) return res.status(400).send();
    mongo_form.create(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
};

function publish(req, res, draft, special = _.noop, next = _.noop) {
    const handlerOptions = {req, res};
    if (!draft) {
        return res.status(400).send();
    }
    const eltToArchive = req.item;
    mongo_data.orgByName(eltToArchive.stewardOrg.name, handleError(handlerOptions, org => {
        if (adminItemSvc.badWorkingGroupStatus(eltToArchive, org)) {
            return res.status(403).send();
        }

        formShared.trimWholeForm(draft);

        mongo_form.update(draft, req.user, handle404(handlerOptions, doc => {
            mongo_form.draftDelete(draft.tinyId, handleError(handlerOptions, () => res.send(doc)));
            next(doc);
        }));
    }));
}

exports.publishFromDraft = (req, res) => {
    mongo_form.draftById(req.body._id, handle404({req, res}, draft => {
        if (draft.__v !== req.body.__v) {
            return res.status(400).send('Cannot publish this old version. Reload and redo.');
        }
        publish(req, res, draft.toObject(), (newElt, oldElt) => {
            newElt.attachments = oldElt.attachments;
            newElt.classification = oldElt.classification;
        });
    }));
};

exports.publishExternal = (req, res) => {
    mongo_form.draftById(req.body._id, handleError({req, res}, draft => {
        if (draft) {
            return res.status(400).send('Publishing would override an existing draft. Address the draft first.');
        }
        publish(req, res, req.body);
    }));
};

exports.originalSourceByTinyIdSourceName = (req, res) => {
    let tinyId = req.params.tinyId;
    let sourceName = req.params.sourceName;
    mongo_form.originalSourceByTinyIdSourceName(tinyId, sourceName, handle404({req, res}, originalSource => {
        res.send(originalSource);
    }));
};

exports.syncLinkedFormsProgress = {done: 0, total: 0};

async function syncLinkedForms() {
    let t0 = Date.now();
    exports.syncLinkedFormsProgress = {done: 0, total: 0};
    const cdeCursor = mongo_cde.getStream({archived: false});
    exports.syncLinkedFormsProgress.total = await mongo_cde.count({archived: false});
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
        exports.syncLinkedFormsProgress.done++;
    }
    exports.syncLinkedFormsProgress.timeTaken = Date.now() - t0;
}

exports.syncLinkedForms = syncLinkedForms;

