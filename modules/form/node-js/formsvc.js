var js2xml = require('js2xmlparser')
    , JXON = require('jxon')
    , mongo_form = require('./mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , mongo_cde = require('../../cde/node-js/mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , authorization = require('../../system/node-js/authorization')
    , formShared = require('../shared/formShared')
    , sdc = require('./sdcForm')
    , odm = require('./odmForm')
    , archiver = require('archiver')
    , redCap = require('./redCapForm')
;

function wipeRenderDisallowed(form, req, cb) {
    if (form && form.noRenderAllowed)
        authorization.checkOwnership(mongo_form, form._id, req, function (err, isYouAllowed) {
            if (!isYouAllowed) form.formElements = [];
            cb();
        });
    else cb();
}

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    else mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(form, req.user);
            res.send(form);
        }
    });
};
exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    else mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(form, req.user);
            res.send(form);
        }
    });
};

exports.wholeFormByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    else mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) res.status(500).send();
        else formShared.fetchWholeForm(form, function (wholeForm) {
            if (!wholeForm) return res.status(404).end();
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            else res.send(wholeForm);
        });
    });
};
exports.wholeFormById = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    else mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send();
        else formShared.fetchWholeForm(form, function (wholeForm) {
            if (!wholeForm) return res.status(404).end();
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            else res.send(wholeForm);
        });
    });
};

exports.versionById = function (req, res) {
    let id = req.params.id;
    mongo_form.versionById(id, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form.version);
    });
};

exports.versionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_form.versionByTinyId(tinyId, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form.version);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form);
    });
};

exports.createForm = function (req, res) {
    if (req.params.id) return res.status(500).send("bad request");
    else {
        if (req.isAuthenticated()) {
            let elt = req.body;
            let user = req.user;
            if (!elt.stewardOrg.name) return res.send("Missing Steward");
            else if (user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
                user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !user.siteAdmin)
                return res.status(403).send("not authorized");
            else if (elt.registrationState && elt.registrationState.registrationStatus &&
                ((elt.registrationState.registrationStatus === "Standard" ||
                    elt.registrationState.registrationStatus === " Preferred Standard") &&
                    !user.siteAdmin))
                return res.status(403).send("Not authorized");
            else mongo_form.create(elt, user, function (err, dataElement) {
                    if (err) res.status(500).send();
                    else res.send(dataElement);
                });
        } else res.status(403).send("You are not authorized to do this.");
    }
};

exports.updateForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    else {
        if (req.isAuthenticated()) {
            let user = req.user;
            mongo_form.eltByTinyId(tinyId, function (err, item) {
                if (err) return res.status(500).send();
                else if (item) {
                    allowUpdate(user, item, function (err) {
                        if (err) res.status(500).send();
                        else mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
                            let allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
                            if (org && org.workingGroupOf &&
                                org.workingGroupOf.length > 0 &&
                                allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1)
                                return res.status(403).send("Not authorized");
                            else {
                                let elt = req.body;
                                mongo_form.update(elt, req.user, function (err, response) {
                                    if (err) res.status(500).send();
                                    else res.send(response);
                                });
                            }
                        });
                    });
                } else return res.status(500).send("Element not exist.");
            });
        } else res.status(403).send("You are not authorized to do this.");
    }
};

exports.priorForms = function (req, res) {
    let formId = req.params.id;
    if (!formId) return res.status(500).send();
    mongo_form.priorForms(formId, function (err, priorForms) {
        if (err) res.status(500).send();
        else res.send(priorForms);
    });
};

function allowUpdate(user, item, cb) {
    if (item.archived === true) {
        return cb("Element is archived.");
    } else if (user.orgCurator.indexOf(item.stewardOrg.name) < 0 &&
        user.orgAdmin.indexOf(item.stewardOrg.name) < 0 &&
        !user.siteAdmin) {
        cb("Not authorized");
    } else if ((item.registrationState.registrationStatus === "Standard" ||
            item.registrationState.registrationStatus === "Preferred Standard") &&
        !user.siteAdmin) {
        cb("This record is already standard.");
    } else if ((item.registrationState.registrationStatus !== "Standard" &&
            item.registrationState.registrationStatus !== " Preferred Standard") &&
        (item.registrationState.registrationStatus === "Standard" ||
            item.registrationState.registrationStatus === "Preferred Standard") &&
        !user.siteAdmin
    ) cb("Not authorized");
    else cb();
}

exports.odmXmlById = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    else mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                odm.getFormOdm(wholeForm, function (err, xmlForm) {
                    if (err) res.status(err).send(xmlForm);
                    else {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.setHeader("Content-Type", "application/xml");
                        res.send(JXON.jsToString({element: xmlForm}));
                    }
                });
            });
        });
    });
};
exports.odmXmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    else mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                odm.getFormOdm(wholeForm, function (err, xmlForm) {
                    if (err) res.status(err).send(xmlForm);
                    else {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.setHeader("Content-Type", "application/xml");
                        res.send(JXON.jsToString({element: xmlForm}));
                    }
                });
            });
        });
    });
};

exports.sdcXmlById = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        else {
            if (!req.user) adminSvc.hideProprietaryIds(form);
            else wipeRenderDisallowed(form, req, function () {
                formShared.fetchWholeForm(form, function (wholeForm) {
                    if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                    sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.setHeader("Content-Type", "application/xml");
                        res.send(txt);
                    });
                });
            });
        }
    });
};

exports.sdcXmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        else {
            if (!req.user) adminSvc.hideProprietaryIds(form);
            else wipeRenderDisallowed(form, req, function () {
                formShared.fetchWholeForm(form, function (wholeForm) {
                    if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                    sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.setHeader("Content-Type", "application/xml");
                        res.send(txt);
                    });
                });
            });
        }
    });
};

exports.sdcHtmlById = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        else {
            if (!req.user) adminSvc.hideProprietaryIds(form);
            else wipeRenderDisallowed(form, req, function () {
                formShared.fetchWholeForm(form, function (wholeForm) {
                    if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                    sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.send(txt);
                    });
                });
            });
        }
    });
};
exports.sdcHtmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        else {
            if (!req.user) adminSvc.hideProprietaryIds(form);
            else wipeRenderDisallowed(form, req, function () {
                formShared.fetchWholeForm(form, function (wholeForm) {
                    if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                    sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.send(txt);
                    });
                });
            });
        }
    });
};

let redCapExportWarnings = {
    'PhenX': 'You can download PhenX REDCap from <a class="alert-link" href="https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist">here</a>.',
    'PROMIS / Neuro-QOL': 'You can download PROMIS / Neuro-QOL REDCap from <a class="alert-link" href="http://project-redcap.org/">here</a>.',
    'emptySection': 'REDCap cannot support empty section.',
    'nestedSection': 'REDCap cannot support nested section.',
    'unknownElementType': 'This form has error.'
};
exports.redCapZipByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (redCapExportWarnings[form.stewardOrg.name])
                    return res.status(202).send(redCapExportWarnings[wholeForm.stewardOrg.name]);
                let validationErr = redCap.loopForm(wholeForm);
                if (validationErr)
                    return res.status(500).send(redCapExportWarnings[validationErr]);
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                res.writeHead(200, {
                    'Content-Type': 'application/zip',
                    'Content-disposition': 'attachment; filename=' + wholeForm.naming[0].designation + '.zip'
                });
                var zip = archiver('zip', {});
                zip.on('error', function (err) {
                    res.status(500).send({error: err.message});
                });

                //on stream closed we can end the request
                zip.on('end', function () {
                });
                zip.pipe(res);
                zip.append('NLM', {name: 'AuthorID.txt'})
                    .append(form.tinyId, {name: 'InstrumentID.txt'})
                    .append(redCap.formToRedCap(wholeForm), {name: 'instrument.csv'})
                    .finalize();
            });
        });
    });
};

exports.redCapZipById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byTinyId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (redCapExportWarnings[form.stewardOrg.name])
                    return res.status(202).send(redCapExportWarnings[wholeForm.stewardOrg.name]);
                let validationErr = redCap.loopForm(wholeForm);
                if (validationErr)
                    return res.status(500).send(redCapExportWarnings[validationErr]);
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                res.writeHead(200, {
                    'Content-Type': 'application/zip',
                    'Content-disposition': 'attachment; filename=' + wholeForm.naming[0].designation + '.zip'
                });
                var zip = archiver('zip', {});
                zip.on('error', function (err) {
                    res.status(500).send({error: err.message});
                });

                //on stream closed we can end the request
                zip.on('end', function () {
                });
                zip.pipe(res);
                zip.append('NLM', {name: 'AuthorID.txt'})
                    .append(form.tinyId, {name: 'InstrumentID.txt'})
                    .append(redCap.formToRedCap(wholeForm), {name: 'instrument.csv'})
                    .finalize();
            });
        });
    });
};


exports.xmlById = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                let exportForm = form.toObject();
                delete exportForm._id;
                delete exportForm.history;
                exportForm.formElements.forEach(function (s) {
                    s.formElements.forEach(function (q) {
                        delete q._id;
                    });
                });
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(JXON.jsToString({element: exportForm}));
            });
        });
    });
};

exports.xmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        else wipeRenderDisallowed(form, req, function () {
            formShared.fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                let exportForm = form.toObject();
                delete exportForm._id;
                delete exportForm.history;
                exportForm.formElements.forEach(function (s) {
                    s.formElements.forEach(function (q) {
                        delete q._id;
                    });
                });
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(JXON.jsToString({element: exportForm}));
            });
        });
    });
};