const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const config = require('../system/parseConfig');
const mongo_cde = require("../cde/mongo-cde");
const mongo_form = require("./mongo-form");
const mongo_data = require("../system/mongo-data");
const formShared = require('esm')(module)('../../shared/form/fe');
const authorization = require("../system/authorization");
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const nih = require("./nihForm");
const sdc = require("./sdcForm");
const odm = require("./odmForm");
const redCap = require("./redCapForm");
const publishForm = require("./publishForm");
const toQuestionnaire = require('esm')(module)('../../shared/mapping/fhir/to/toQuestionnaire');
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const respondError = dbLogger.respondError;
const elastic = require('../system/elastic.js');

const ajv = new Ajv({schemaId: 'auto'}); // current FHIR schema uses legacy JSON Schema version 4
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
fs.readdirSync(path.resolve(__dirname, '../../shared/mapping/fhir/assets/schema/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajv.addSchema(require('../../shared/mapping/fhir/assets/schema/' + file));
    }
});

function setResponseXmlHeader(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Content-Type", "application/xml");
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
                        res.setHeader("Content-Type", "text/xml");
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
        mongo_form.Form.find({}, {"updatedBy.username": 1, updated: 1, "changeNote": 1, version: 1, elementType: 1})
            .where("_id").in(history).exec((err, priorForms) => {
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
                            res.setHeader("Content-Type", "text/xml");
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

exports.draftForm = (req, res) => { // WORKAROUND: sends empty instead of 404 to not cause angular to litter console
    const handlerOptions = {req, res};
    let tinyId = req.params.tinyId;
    if (!tinyId) {
        res.status(400).send();
        return;
    }
    if (!authorizationShared.isOrgCurator(req.user)) {
        res.send();
        return;
    }
    mongo_form.byTinyId(tinyId, handleError(handlerOptions, form => {
        if (!authorizationShared.canEditCuratedItem(req.user, form)) {
            res.send();
            return;
        }
        mongo_form.draftForm(tinyId, handleError(handlerOptions, form => {
            if (!form) {
                res.send();
                return;
            }
            fetchWholeFormOutdated(form.toObject(), handleError(handlerOptions, wholeForm =>
                res.send(wholeForm)
            ));
        }));
    }));
};

exports.draftFormById = (req, res) => {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.draftFormById(id, handleError({req, res}, form => {
        if (!form) return res.send();
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => res.send(wholeForm)));
    }));
};

exports.forEditById = (req, res) => {
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404({req, res}, form => {
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
};

exports.forEditByTinyId = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handle404({req, res}, form => {
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
            mongo_data.addFormToViewHistory(wholeForm, req.user);
        }));
    }));
};

exports.forEditByTinyIdAndVersion = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, handle404({req, res}, form => {
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req.user);
            res.send(wholeForm);
        }));
    }));
};

exports.saveDraft = (req, res) => {
    let elt = req.body;
    let tinyId = req.params.tinyId;
    let user = req.user;
    if (!elt || !tinyId || elt.tinyId !== tinyId
        || !elt.designations || !elt.designations.length) {
        return res.status(400).send();
    }
    if (!elt.created) elt.created = new Date();
    if (!elt.createdBy) {
        elt.createdBy = {
            userId: user._id,
            username: user.username
        };
    }
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
    mongo_form.saveDraft(elt, handleError({req, res}, elt => {
        if (!elt) {
            res.status(409).send('Edited by someone else. Please refresh and redo.');
            return;
        }
        res.send(elt);
    }));
};

exports.deleteDraftForm = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.deleteDraftForm(tinyId, handleError({req, res}, () => res.send()));
};

exports.byTinyIdList = (req, res) => {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) return res.status(400).send();
    tinyIdList = tinyIdList.split(",");
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

exports.publishForm = (req, res) => {
    if (!req.params.id || req.params.id.length !== 24) return res.status(400).send();
    mongo_form.byId(req.params.id, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            publishForm.getFormForPublishing(wholeForm, req, res);
        }));
    }));
};

exports.createForm = (req, res) => {
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg || !elt.stewardOrg.name) return res.status(400).send();
    mongo_form.create(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
};

exports.updateForm = (req, res) => {
    let elt = req.body;
    let tinyId = req.params.tinyId;
    if (!elt || !tinyId || elt.tinyId !== tinyId
        || !elt.designations || !elt.designations.length) {
        return res.status(400).send();
    }
    mongo_data.orgByName(elt.stewardOrg.name, handleError({req, res}, org => {
        let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
        if (org && org.workingGroupOf && org.workingGroupOf.length > 0
            && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
            return res.status(403).send("Not authorized");
        }
        formShared.trimWholeForm(elt);
        mongo_form.update(elt, req.user, handleError({req, res}, response => {
            mongo_form.deleteDraftForm(elt.tinyId, handleError({req, res}, () => res.send(response)));
        }));
    }));
};

exports.publishTheForm = (req, res) => {
    let elt = req.body;
    if (!elt || !elt.designations || !elt.designations.length) {
        return res.status(400).send();
    }
    const item = req.item;
    mongo_data.orgByName(item.stewardOrg.name, handleError({req, res}, org => {
        let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
        if (org && org.workingGroupOf && org.workingGroupOf.length > 0
            && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) {
            return res.status(403).send();
        }
        elt.classification = item.classification;
        elt.attachments = item.attachments;
        formShared.trimWholeForm(elt);
        mongo_form.update(elt, req.user, handleError({req, res}, response => {
            mongo_form.deleteDraftForm(elt.tinyId, handleError({req, res}, () => res.send(response)));
        }));
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

