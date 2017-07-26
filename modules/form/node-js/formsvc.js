let async = require("async");
let JXON = require("jxon");
let archiver = require("archiver");
let _ = require("lodash");
let mongo_form = require("./mongo-form");
let mongo_data_system = require("../../system/node-js/mongo-data");
let adminSvc = require("../../system/node-js/adminItemSvc.js");
let authorization = require("../../system/node-js/authorization");
let sdc = require("./sdcForm");
let odm = require("./odmForm");
let redCap = require("./redCapForm");
let publishForm = require("./publishForm");


function fetchWholeForm(Form, callback) {
    let maxDepth = 8;
    let depth = 0;
    let form = _.cloneDeep(Form);
    let loopFormElements = function (form, cb) {
        if (form.formElements) {
            async.forEach(form.formElements, function (fe, doneOne) {
                if (fe.elementType === "form") {
                    depth++;
                    if (depth < maxDepth) mongo_form.byTinyIdAndVersion(fe.inForm.form.tinyId, fe.inForm.form.version, function (err, result) {
                        result = result.toObject();
                        fe.formElements = result.formElements;
                        loopFormElements(fe, function () {
                            depth--;
                            doneOne();
                        });
                    }); else doneOne();
                } else if (fe.elementType === "section") {
                    loopFormElements(fe, function () {
                        doneOne();
                    });
                } else {
                    doneOne();
                }
            }, function doneAll() {
                cb();
            });
        } else cb();
    };
    loopFormElements(form, function () {
        if (form.toObject) form = form.toObject();
        callback(form);
    });
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
        if (err) return res.status(500).send(err);
        if (!form) return res.status(404).send();
        fetchWholeForm(form, function (wholeForm) {
            wipeRenderDisallowed(wholeForm, req, function () {
                if (req.query.type === 'xml') {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.setHeader("Content-Type", "application/xml");
                    res.send(wholeForm);
                    /*
                                        let cde = wholeForm.toObject();
                                        JXON.jsToString({element: xmlForm})
                    */
                }
                res.send(form);
            });
        });
        mongo_data_system.addToViewHistory(form, req.user);
    });
};

exports.priorForms = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send(err);
        if (!form) res.status(404).send();
        mongo_form.byIdList(form.history, function (err, priorForms) {
            if (err) return res.status(500).send(err);
            res.send(priorForms);
        });
    });
};

exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) return res.status(500).send(err);
        if (!form) return res.status(404).send();
        wipeRenderDisallowed(form, req, function () {
            res.send(form);
        });
        mongo_data_system.addToViewHistory(form, req.user);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, function (err, form) {
        if (err) return res.status(500).send();
        if (!form) return res.status(404).send();
        res.send(form);
    });
};
exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_form.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send(err);
        res.send(latestVersion);
    });
};

exports.wholeFormByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) return res.status(500).send();
        fetchWholeForm(form, function (wholeForm) {
            if (!wholeForm) return res.status(404).end();
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            res.send(wholeForm);
        });
    });
};
exports.wholeFormById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err) return res.status(500).send();
        fetchWholeForm(form, function (wholeForm) {
            if (!wholeForm) return res.status(404).end();
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            res.send(wholeForm);
        });
    });
};

exports.versionById = function (req, res) {
    let id = req.params.id;
    mongo_form.versionById(id, function (err, form) {
        if (err) return res.status(500).send();
        res.send(form.version);
    });
};

exports.versionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_form.versionByTinyId(tinyId, function (err, form) {
        if (err) return res.status(500).send();
        res.send(form.version);
    });
};


exports.createForm = function (req, res) {
    if (req.params.id) return res.status(500).send("bad request");
    if (!req.isAuthenticated()) return res.status(403).send("You are not authorized to do this.");
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg.name) return res.send("Missing Steward");
    if (user.orgCurator.indexOf(elt.stewardOrg.name) < 0 && user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !user.siteAdmin)
        return res.status(403).send("not authorized");
    if (elt.registrationState && elt.registrationState.registrationStatus && ((elt.registrationState.registrationStatus === "Standard" || elt.registrationState.registrationStatus === " Preferred Standard") && !user.siteAdmin))
        return res.status(403).send("Not authorized");
    mongo_form.create(elt, user, function (err, dataElement) {
        if (err) return res.status(500).send();
        res.send(dataElement);
    });
};

exports.updateForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    if (!req.isAuthenticated()) return res.status(403).send("You are not authorized to do this.");
    let user = req.user;
    mongo_form.byTinyId(tinyId, function (err, item) {
        if (err) return res.status(500).send();
        if (!item) return res.status(500).send("Element not exist.");
        allowUpdate(user, item, function (err) {
            if (err) return res.status(500).send();
            mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
                let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) return res.status(403).send("Not authorized"); else {
                    let elt = req.body;
                    mongo_form.update(elt, req.user, function (err, response) {
                        if (err) return res.status(500).send();
                        res.send(response);
                    });
                }
            });
        });
    });
};


function allowUpdate(user, item, cb) {
    if (item.archived === true) {
        return cb("Element is archived.");
    } else if (user.orgCurator.indexOf(item.stewardOrg.name) < 0 && user.orgAdmin.indexOf(item.stewardOrg.name) < 0 && !user.siteAdmin) {
        cb("Not authorized");
    } else if ((item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard") && !user.siteAdmin) {
        cb("This record is already standard.");
    } else if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") && (item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard") && !user.siteAdmin) cb("Not authorized"); else cb();
}

exports.odmXmlById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        wipeRenderDisallowed(form, req, function () {
            fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                odm.getFormOdm(wholeForm, function (err, xmlForm) {
                    if (err) return res.status(err).send(xmlForm);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.setHeader("Content-Type", "application/xml");
                    res.send(JXON.jsToString({element: xmlForm}));
                });
            });
        });
    });
};
exports.odmXmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        wipeRenderDisallowed(form, req, function () {
            fetchWholeForm(form, function (wholeForm) {
                if (!wholeForm) return res.status(404).end();
                if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
                odm.getFormOdm(wholeForm, function (err, xmlForm) {
                    if (err) return res.status(err).send(xmlForm);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.setHeader("Content-Type", "application/xml");
                    res.send();
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
        if (!req.user) adminSvc.hideProprietaryIds(form);
        fetchWholeForm(form, function (wholeForm) {
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(txt);
            });
        });
    });
};

exports.sdcXmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        if (!req.user) adminSvc.hideProprietaryIds(form);
        fetchWholeForm(form, function (wholeForm) {
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(txt);
            });
        });
    });
};

exports.sdcHtmlById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        if (!req.user) adminSvc.hideProprietaryIds(form);
        fetchWholeForm(form, function (wholeForm) {
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            sdc.formToSDC(wholeForm, "defaultHtml", function (txt) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(txt);
            });
        });
    });
};
exports.sdcHtmlByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        if (!req.user) adminSvc.hideProprietaryIds(form);
        fetchWholeForm(form, function (wholeForm) {
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            sdc.formToSDC(wholeForm, "defaultHtml", function (txt) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                res.send(txt);
            });
        });
    });
};

let redCapExportWarnings = {
    "PhenX": "You can download PhenX REDCap from <a class='alert-link' href='https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist'>here</a>.",
    "PROMIS / Neuro-QOL": "You can download PROMIS / Neuro-QOL REDCap from <a class='alert-link' href='http://project-redcap.org/'>here</a>.",
    "emptySection": "REDCap cannot support empty section.",
    "nestedSection": "REDCap cannot support nested section.",
    "unknownElementType": "This form has error."
};
exports.redCapZipByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        fetchWholeForm(form, function (wholeForm) {
            if (redCapExportWarnings[form.stewardOrg.name]) return res.status(202).send(redCapExportWarnings[wholeForm.stewardOrg.name]);
            let validationErr = redCap.loopForm(wholeForm);
            if (validationErr) return res.status(500).send(redCapExportWarnings[validationErr]);
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            res.writeHead(200, {
                "Content-Type": "application/zip",
                "Content-disposition": "attachment; filename=" + wholeForm.naming[0].designation + ".zip"
            });
            let zip = archiver("zip", {});
            zip.on("error", function (err) {
                res.status(500).send({error: err.message});
            });

            //on stream closed we can end the request
            zip.on("end", function () {
            });
            zip.pipe(res);
            zip.append("NLM", {name: "AuthorID.txt"})
                .append(form.tinyId, {name: "InstrumentID.txt"})
                .append(redCap.formToRedCap(wholeForm), {name: "instrument.csv"})
                .finalize();
        });
    });
};

exports.redCapZipById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        fetchWholeForm(form, function (wholeForm) {
            if (redCapExportWarnings[form.stewardOrg.name]) return res.status(202).send(redCapExportWarnings[wholeForm.stewardOrg.name]);
            let validationErr = redCap.loopForm(wholeForm);
            if (validationErr) return res.status(500).send(redCapExportWarnings[validationErr]);
            if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
            res.writeHead(200, {
                "Content-Type": "application/zip",
                "Content-disposition": "attachment; filename=" + wholeForm.naming[0].designation + ".zip"
            });
            let zip = archiver("zip", {});
            zip.on("error", function (err) {
                res.status(500).send({error: err.message});
            });

            //on stream closed we can end the request
            zip.on("end", function () {
            });
            zip.pipe(res);
            zip.append("NLM", {name: "AuthorID.txt"})
                .append(form.tinyId, {name: "InstrumentID.txt"})
                .append(redCap.formToRedCap(wholeForm), {name: "instrument.csv"})
                .finalize();
        });
    });
};


exports.xmlById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    mongo_form.byId(id, function (err, form) {
        if (err || !form) return res.status(404).end();
        wipeRenderDisallowed(form, req, function () {
            fetchWholeForm(form, function (wholeForm) {
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
    if (!tinyId) return res.status(500).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err || !form) return res.status(404).end();
        wipeRenderDisallowed(form, req, function () {
            fetchWholeForm(form, function (wholeForm) {
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


exports.publishForm = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(500).send();
    if (!req.isAuthenticated()) return res.status(401).send("Not Authorized");
    mongo_form.byId(id, function (err, form) {
        publishForm.getFormForPublishing(form, req, res);
    });
};
