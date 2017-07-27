let JXON = require("jxon");
let archiver = require("archiver");
let mongo_form = require("./mongo-form");
let mongo_data_system = require("../../system/node-js/mongo-data");
let adminSvc = require("../../system/node-js/adminItemSvc.js");
let authorization = require("../../system/node-js/authorization");
let sdc = require("./sdcForm");
let odm = require("./odmForm");
let redCap = require("./redCapForm");
let publishForm = require("./publishForm");

let redCapExportWarnings = {
    "PhenX": "You can download PhenX REDCap from <a class='alert-link' href='https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist'>here</a>.",
    "PROMIS / Neuro-QOL": "You can download PROMIS / Neuro-QOL REDCap from <a class='alert-link' href='http://project-redcap.org/'>here</a>.",
    "emptySection": "REDCap cannot support empty section.",
    "nestedSection": "REDCap cannot support nested section.",
    "unknownElementType": "This form has error."
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

function allowCreate(user, elt, cb) {
    if (!elt.stewardOrg.name) return cb("Missing Steward");
    if (user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
        user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 &&
        !user.siteAdmin)
        return cb("Not authorized");
    if (elt.registrationState && elt.registrationState.registrationStatus &&
        ((elt.registrationState.registrationStatus === "Standard" ||
            elt.registrationState.registrationStatus === " Preferred Standard") &&
            !user.siteAdmin))
        return cb("Not authorized");
}

function wipeRenderDisallowed(form, req, cb) {
    if (!req.user) adminSvc.hideProprietaryIds(form);
    if (form && form.noRenderAllowed) {
        authorization.checkOwnership(mongo_form, form._id, req, function (err, isYouAllowed) {
            if (err) return cb(err);
            if (!isYouAllowed) form.formElements = [];
            return cb();
        });
    } else cb();
}

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.byId(id, function (err, form) {
        if (err) return res.status(500).send(err);
        if (!form) return res.status(404).send();
        wipeRenderDisallowed(form, req, function (err) {
            if (err) return res.status(500).send(err);
            if (req.query.type === 'xml') {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader("Content-Type", "application/xml");
                if (req.query.subtype === 'odm') {
                    odm.getFormOdm(form, function (err, xmlForm) {
                        if (err) return res.status(500).send(err);
                        return res.send(xmlForm);
                    });
                } else if (req.query.subtype === 'sdc') {
                    sdc.formToSDC(form, req.query.renderer, function (txt) {
                        return res.send(txt);
                    });
                } else {
                    let exportForm = form.toObject();
                    delete exportForm._id;
                    delete exportForm.history;
                    exportForm.formElements.forEach(function (s) {
                        s.formElements.forEach(function (q) {
                            delete q._id;
                        });
                    });
                    return res.send(JXON.jsToString({element: exportForm}));
                }
            } else if (req.query.type && req.query.type.toLowerCase() === 'redcap') {
                if (redCapExportWarnings[form.stewardOrg.name])
                    return res.status(202).send(redCapExportWarnings[form.stewardOrg.name]);
                let validationErr = redCap.loopForm(form);
                if (validationErr) return res.status(500).send(redCapExportWarnings[validationErr]);
                res.writeHead(200, {
                    "Content-Type": "application/zip",
                    "Content-disposition": "attachment; filename=" + form.naming[0].designation + ".zip"
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
                    .append(redCap.formToRedCap(form), {name: "instrument.csv"})
                    .finalize();
            }
            else res.send(form);
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
        wipeRenderDisallowed(form, req, function (err) {
            if (err) return res.status(500).send(err);
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
        wipeRenderDisallowed(form, req, function (err) {
            if (err) return res.status(500).send(err);
            res.send(form);
        });
    });
};

exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send(err);
        res.send(latestVersion);
    });
};

exports.publishForm = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(401).send("Not Authorized");
    mongo_form.byId(id, function (err, form) {
        publishForm.getFormForPublishing(form, req, res);
    });
};

exports.createForm = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    let user = req.user;
    allowCreate(user, elt, function (err) {
        if (err) return res.status(500).send(err);
        mongo_form.create(elt, user, function (err, dataElement) {
            if (err) return res.status(500).send(err);
            res.send(dataElement);
        });
    });
};

exports.updateForm = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let user = req.user;
    mongo_form.byTinyId(tinyId, function (err, item) {
        if (err) return res.status(400).send();
        if (!item) return res.status(404).send();
        allowUpdate(user, item, function (err) {
            if (err) return res.status(500).send(err);
            mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
                let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) return res.status(403).send("Not authorized"); else {
                    let elt = req.body;
                    mongo_form.update(elt, req.user, function (err, response) {
                        if (err) return res.status(500).send(err);
                        res.send(response);
                    });
                }
            });
        });
    });
};

