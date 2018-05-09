const Ajv = require('ajv');
const async = require('async');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const config = require('../system/parseConfig');
const mongo_cde = require("../cde/mongo-cde");
const mongo_form = require("./mongo-form");
const mongo_data = require("../system/mongo-data");
const formShared = require('@std/esm')(module)('../../shared/form/formShared');
const authorization = require("../system/authorization");
const nih = require("./nihForm");
const sdc = require("./sdcForm");
const odm = require("./odmForm");
const redCap = require("./redCapForm");
const publishForm = require("./publishForm");
const toQuestionnaire = require('@std/esm')(module)('../../shared/mapping/fhir/to/toQuestionnaire');
const dbLogger = require('../system/dbLogger');

const ajv = new Ajv({schemaId: 'auto'}); // current FHIR schema uses legacy JSON Schema version 4
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
fs.readdirSync(path.resolve(__dirname, '../../shared/mapping/fhir/schema/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajv.addSchema(require('../../shared/mapping/fhir/schema/' + file));
    }
});

function setResponseXmlHeader(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Content-Type", "application/xml");
}

// callback(err, form)
function fetchWholeForm(form, callback) {
    if (!form) return callback();
    formShared.iterateFe(form,
        (f, cb) => {
            let inFormInfo = f.inForm.form;
            mongo_form.byTinyIdAndVersion(inFormInfo.tinyId, inFormInfo.version, function (err, result) {
                if (err) {
                    return cb("Retrieving form tinyId: " + inFormInfo.tinyId + " version: " + inFormInfo.version + " has error: " + err);
                }
                result = result.toObject();
                f.formElements = result.formElements;
                mongo_form.Form.findOne({tinyId: inFormInfo.tinyId, archived: false}, {version: 1}, (err, elt) => {
                    if (err || !elt) {
                        return cb(err);
                    }
                    let version = inFormInfo.version ? inFormInfo.version : null;
                    let currentVersion = elt.version ? elt.version : null;
                    if (version !== currentVersion) {
                        inFormInfo.outdated = true;
                        form.outdated = true;
                    }
                    cb();
                });
            });
        },
        undefined,
        (q, cb) => {
            mongo_cde.DataElement.findOne({
                tinyId: q.question.cde.tinyId,
                archived: false
            }, {version: 1}, (err, elt) => {
                if (err || !elt) {
                    return cb(err);
                }
                let version = q.question.cde.version ? q.question.cde.version : null;
                let currentVersion = elt.version ? elt.version : null;
                if (version !== currentVersion) {
                    q.question.cde.outdated = true;
                    form.outdated = true;
                }
                cb();
            });
        },
        err => {
            callback(err, form);
        }
    );
}

function wipeRenderDisallowed(form, req, cb) {
    if (form && form.noRenderAllowed) {
        authorization.checkOwnership(mongo_form, form._id, req, function (err, isYouAllowed) {
            if (!isYouAllowed) form.formElements = [];
            cb();
        });
    } else cb();
}

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.byId(id, function (err, form) {
        if (err) return res.status(500).send("ERROR - cannot get form by id");
        if (!form) return res.status(404).send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - cannot fetch whole form");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR - cannot wipe form data");
                if (req.query.type === 'xml') {
                    setResponseXmlHeader(res);
                    if (req.query.subtype === 'odm') {
                        odm.getFormOdm(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR - canont get form as odm");
                            res.setHeader("Content-Type", "text/xml");
                            return res.send(xmlForm);
                        });
                    } else if (req.query.subtype === 'sdc') {
                        sdc.formToSDC({form: wholeForm, rendered: req.query.renderer, validate: req.query.validate}, (err, sdcForm) => {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                    } else {
                        nih.getFormNih(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR - cannot get json export");
                            return res.send(xmlForm);
                        });
                    }
                } else if (req.query.type && req.query.type.toLowerCase() === 'redcap') {
                    redCap.getZipRedCap(wholeForm, res);
                } else {
                    if (req.query.subtype === 'fhirQuestionnaire') {
                        formShared.addFormIds(wholeForm);
                        if (req.query.hasOwnProperty('validate')) {
                            let p = path.resolve(__dirname, '../../shared/mapping/fhir/schema/Questionnaire.schema.json');
                            fs.readFile(p, (err, data) => {
                                if (err || !data) return dbLogger.respondError(res, err, 'schema missing', {origin: 'formsvc'});
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
            });
            mongo_data.addToViewHistory(wholeForm, req.user);
        });
    });
};

exports.priorForms = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send("ERROR - cannot get form by id for prior");
        if (!form) res.status(404).send();
        let history = form.history.concat([form._id]).reverse();
        mongo_form.Form.find({}, {"updatedBy.username": 1, updated: 1, "changeNote": 1, version: 1, elementType: 1})
            .where("_id").in(history).exec((err, priorForms) => {
            mongo_data.sortArrayByArray(priorForms, history);
            res.send(priorForms);
        });
    });
};

exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) return res.status(500).send("ERROR - get form by tinyid");
        if (!form) return res.status(404).send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - form by tinyId whole form");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR - form by tinyId - wipe");
                if (req.query.type === 'xml') {
                    setResponseXmlHeader(res);
                    if (req.query.subtype === 'odm')
                        odm.getFormOdm(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR - form by tinyId odm ");
                            res.setHeader("Content-Type", "text/xml");
                            return res.send(xmlForm);
                        });
                    else if (req.query.subtype === 'sdc')
                        sdc.formToSDC({form: wholeForm, renderer: req.query.renderer, validate: req.query.validate}, (err, sdcForm) => {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                    else nih.getFormNih(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR - form by tinyId json");
                            return res.send(xmlForm);
                        });
                } else if (req.query.type && req.query.type.toLowerCase() === 'redcap')
                    redCap.getZipRedCap(wholeForm, res);
                else res.send(wholeForm);
            });
            mongo_data.addToViewHistory(wholeForm, req.user);
        });
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, function (err, form) {
        if (err) return res.status(500).send();
        if (!form) return res.status(404).send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - form by id / version");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR - form by id version wipe");
                res.send(wholeForm);
            });
        });
    });
};

exports.byTinyIdAndVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, function (err, form) {
        if (err) return res.status(500).send();
        if (!form) return res.status(404).send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - form by id / version");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR - form by id version wipe");
                res.send(wholeForm);
            });
        });
    });
};

exports.draftForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.draftForm(tinyId, function (err, form) {
        if (err) return res.status(500).send("ERROR - get draft form. " + tinyId);
        if (!form) return res.send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - get draft form. " + tinyId);
            res.send(wholeForm);
        });
    });
};
exports.draftFormById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.draftFormById(id, function (err, form) {
        if (err) return res.status(500).send("ERROR - get draft form. " + id);
        if (!form) return res.send();
        fetchWholeForm(form.toObject(), function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR - get draft form. " + id);
            res.send(wholeForm);
        });
    });
};

exports.saveDraftForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let elt = req.body;
    if (elt.tinyId !== tinyId) return res.status(500);
    if (req.user && req.user.username) elt.createdBy.username = req.user.username;
    if (!elt.created) elt.created = new Date();
    elt.updated = new Date();
    mongo_form.saveDraftForm(elt, function (err, form) {
        if (err) {
            dbLogger.logError({
                message: "Error saving draft: " + tinyId,
                origin: "formSvc.saveDraftDataElement",
                stack: err,
                details: ""
            });
            return res.status(500).send("ERROR - save draft form. " + tinyId);
        }
        res.send(form);
    });
};
exports.deleteDraftForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.deleteDraftForm(tinyId, function (err) {
        if (err) return res.status(500).send("ERROR - delete draft form. " + tinyId);
        res.send();
    });
};

exports.byTinyIdList = function (req, res) {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) return res.status(400).send();
    tinyIdList = tinyIdList.split(",");
    mongo_form.byTinyIdList(tinyIdList, function (err, forms) {
        if (err) res.status(500).send("ERROR - form by idList");
        res.send(forms.map(mongo_data.formatElt));
    });
};

exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send("ERROR - form by latest id");
        res.send(latestVersion);
    });
};

exports.publishForm = function (req, res) {
    if (!req.params.id) return res.status(400).send();
    mongo_form.byId(req.params.id, dbLogger.handleGenericError(
        {res: res, origin: "Publish form"},
        form => {
            if (!form) return res.status(400).send('form not found');
            fetchWholeForm(form.toObject(), dbLogger.handleGenericError(
                {res: res, message: 'Fetch whole for publish', origin: "publishForm"}, wholeForm => {
                publishForm.getFormForPublishing(wholeForm, req, res);
            }));
    }));
};

exports.createForm = function (req, res) {
    let id = req.params.id;
    if (id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    let user = req.user;
    authorization.allowCreate(user, elt, function (err) {
        if (err) return res.status(500).send("ERROR - cannot allow to create form ");
        mongo_form.create(elt, user, function (err, dataElement) {
            if (err) return res.status(500).send("ERROR - cannot create form");
            res.send(dataElement);
        });
    });
};

exports.updateForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    authorization.allowUpdate(req.user, elt, function (err) {
        if (err) return res.status(500).send("ERROR - update - cannot allow");
        mongo_data.orgByName(elt.stewardOrg.name, function (err, org) {
            let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
            if (org && org.workingGroupOf && org.workingGroupOf.length > 0
                && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
                return res.status(403).send("Not authorized");
            }
            formShared.trimWholeForm(elt);
            mongo_form.update(elt, req.user, function (err, response) {
                if (err) return res.status(500).send("ERROR - cannot update form. ");
                mongo_form.deleteDraftForm(elt.tinyId, err => {
                    if (err) return res.status(500).send("ERROR - cannot delete draft. ");
                    res.send(response);
                });
            });
        });
    });
};
exports.publishTheForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    mongo_form.byTinyId(tinyId, function (err, item) {
        if (err) return res.status(500).send("ERROR - update find by tinyId");
        if (!item) return res.status(404).send();
        authorization.allowUpdate(req.user, item, function (err) {
            if (err) return res.status(500).send("ERROR - update - cannot allow");
            mongo_data.orgByName(item.stewardOrg.name, function (err, org) {
                let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0
                    && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) {
                    return res.status(403).send("Not authorized");
                }
                let elt = req.body;
                elt.classification = item.classification;
                elt.attachments = item.attachments;
                formShared.trimWholeForm(elt);
                mongo_form.update(elt, req.user, function (err, response) {
                    if (err) return res.status(500).send("ERROR - cannot update form. ");
                    mongo_form.deleteDraftForm(elt.tinyId, err => {
                        if (err) return res.status(500).send("ERROR - cannot delete draft. ");
                        res.send(response);
                    });
                });
            });
        });
    });
};
