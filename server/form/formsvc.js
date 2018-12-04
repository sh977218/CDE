const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const config = require('../system/parseConfig');
const mongo_cde = require("../cde/mongo-cde");
const mongo_form = require("./mongo-form");
const mongo_data = require("../system/mongo-data");
const formShared = require('@std/esm')(module)('../../shared/form/fe');
const authorization = require("../system/authorization");
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const nih = require("./nihForm");
const sdc = require("./sdcForm");
const odm = require("./odmForm");
const redCap = require("./redCapForm");
const publishForm = require("./publishForm");
const toQuestionnaire = require('@std/esm')(module)('../../shared/mapping/fhir/to/toQuestionnaire');
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const respondError = dbLogger.respondError;

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

function wipeRenderDisallowed(form, req, cb) {
    if (form && form.noRenderAllowed) {
        let isYouAllowed = authorization.checkOwnership(form, req.user);
        if (!isYouAllowed) form.formElements = [];
    }
    cb();
}

/*
|---------------|           |---------------|
|   S1          |           |   S1          |
|       Q1      |           |       Q1      |
|       S2      |           |   S1-S2       |
|           Q2  |    ==>    |       Q2      |
|   S3          |           |   S3          |
|       Q3      |           |       Q3      |
|   Q4          |           |   S4(new)     |
|               |           |       Q4      |
|---------------|           |---------------|
*/
function oneLayerForm(form) {
    /*

        let fn = (parent, current, i) => {
            let parentType = parent.elementType;
            let currentType = current.elementType;
            if (currentType === 'section' || currentType === 'form') {
                if (parentType === 'section' || parentType === 'form') {
                    parent.formElements.splice(i, 1, current);
                } else {
                    for (let i = 0; i < current.formElements.length; i++) {
                        let fe = current.formElements[i];
                        fn(current, fe, i);
                    }
                }
            } else if (current.elementType === 'question') {
                if (parentType !== 'section' || parentType !== 'form') {
                    let fe = {
                        elementType: 'section',
                        label: '',
                        formElements: [current]
                    };
                    parent.formElements.splice(i, 1, fe);
                }
            }

        };

        for (let i = 0; i < form.formElements.length; i++) {
            let fe = form.formElements[i];
            fn(form, fe, i);
        }
    */

    let fn = (fe, depth, result, sectionLabel) => {
        for (let i = 0; i < fe.formElements.length; i++) {
            let _fe = fe.formElements[i];
            let type = fe.elementType;
            if (depth === 0) {

            } else {

            }
            if (type === 'question' && depth === 0) {
                result.push({
                    elementType: 'section',
                    label: '',
                    formElements: [fe]
                });
            } else {
                depth++;
                fn(fe.formElements, depth, result);
                depth--;
            }
        }
    };
    let result = [];
    fn(form, 0, result);
}

exports.byId = (req, res) => {
    let id = req.params.id;
    if (!id || id.length !== 24) return res.status(400).send();
    mongo_form.byId(id, handle404({req, res}, form => {
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req, handleError({req, res}, () => {
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
            }));
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
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, handle404({req, res}, form => {
        fetchWholeFormOutdated(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req, handleError({req, res}, () => {
                if (req.query.type === 'xml') {
                    setResponseXmlHeader(res);
                    if (req.query.subtype === 'odm')
                        odm.getFormOdm(wholeForm, handleError({req, res}, xmlForm => {
                            res.setHeader("Content-Type", "text/xml");
                            return res.send(xmlForm);
                        }));
                    else if (req.query.subtype === 'sdc')
                        sdc.formToSDC({
                            form: wholeForm,
                            renderer: req.query.renderer,
                            validate: req.query.validate
                        }, (err, sdcForm) => {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                    else nih.getFormNih(wholeForm, handleError({req, res}, xmlForm => res.send(xmlForm)));
                } else if (req.query.type && req.query.type.toLowerCase() === 'redcap')
                    redCap.getZipRedCap(wholeForm, res);
                else res.send(wholeForm);
            }));
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
            wipeRenderDisallowed(wholeForm, req, handleError({req, res}, () => {
                res.send(wholeForm);
            }));
        }));
    }));
};

exports.byTinyIdAndVersion = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdAndVersion(tinyId, version, handle404({req, res}, form => {
        exports.fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => {
            wipeRenderDisallowed(wholeForm, req, handleError({req, res}, () => res.send(wholeForm)));
        }));
    }));
};

exports.draftForm = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (authorizationShared.isOrgCurator(req.user)) {
        mongo_form.byTinyId(req.params.tinyId, handleError({req, res}, form => {
            if (authorizationShared.canEditCuratedItem(req.user, form)) {
                mongo_form.draftForm(tinyId, handleError({req, res}, form => {
                    if (form) {
                        fetchWholeFormOutdated(form.toObject(), handleError({
                            req,
                            res
                        }, wholeForm => res.send(wholeForm)));
                    } else {
                        exports.byTinyId(req, res);
                    }
                }));
            } else {
                exports.byTinyId(req, res);
            }
        }));
    } else {
        exports.byTinyId(req, res);
    }
};

exports.draftFormById = (req, res) => {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.draftFormById(id, handleError({req, res}, form => {
        if (!form) return res.send();
        exports.fetchWholeForm(form.toObject(), handleError({req, res}, wholeForm => res.send(wholeForm)));
    }));
};

exports.saveDraftForm = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let elt = req.body;
    if (!elt.designations || !elt.designations.length) return res.status(400).send();
    if (elt.tinyId !== tinyId) return res.status(500);
    if (req.user && req.user.username) elt.createdBy.username = req.user.username;
    if (!elt.created) elt.created = new Date();
    elt.updated = new Date();
    mongo_form.saveDraftForm(elt, handleError({req, res}, form => res.send(form)));
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
    mongo_form.byTinyIdList(tinyIdList, handleError({
        req,
        res
    }, forms => res.send(forms.map(mongo_data.formatElt))));
};

exports.latestVersionByTinyId = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, handleError({req, res}, latestVersion => res.send(latestVersion)));
};

exports.publishForm = (req, res) => {
    if (!req.params.id || req.params.id.length !== 24) return res.status(400).send();
    mongo_form.byId(req.params.id, handleError({req, res}, form => {
        if (!form) return res.status(400).send('form not found');
        exports.fetchWholeForm(form.toObject(), handleError({
            req, res, message: 'Fetch whole for publish'
        }, wholeForm => {
            publishForm.getFormForPublishing(wholeForm, req, res);
        }));
    }));
};

exports.createForm = (req, res) => {
    let id = req.params.id;
    if (id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    let user = req.user;
    authorization.allowCreate(user, elt, handleError({req, res}, () => {
        mongo_form.create(elt, user, handleError({req, res}, dataElement => res.send(dataElement)));
    }));
};

exports.updateForm = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    authorization.allowUpdate(req.user, elt, handleError({req, res}, () => {
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
    }));
};

exports.publishTheForm = (req, res) => {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let elt = req.body;
    if (!elt.designations || !elt.designations.length) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    mongo_form.byTinyId(tinyId, handle404({req, res}, item => {
        authorization.allowUpdate(req.user, item, handleError({req, res}, () => {
            mongo_data.orgByName(item.stewardOrg.name, handleError({req, res}, org => {
                let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0
                    && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) {
                    return res.status(403).send("Not authorized");
                }
                elt.classification = item.classification;
                elt.attachments = item.attachments;
                formShared.trimWholeForm(elt);
                mongo_form.update(elt, req.user, handleError({req, res}, response => {
                    mongo_form.deleteDraftForm(elt.tinyId, handleError({req, res}, () => res.send(response)));
                }));
            }));
        }));
    }));
};
