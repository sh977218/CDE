let async = require("async");
let _ = require("lodash");
let mongo_cde = require("../../cde/node-js/mongo-cde");
let mongo_form = require("./mongo-form");
let mongo_data_system = require("../../system/node-js/mongo-data");
let authorization = require("../../system/node-js/authorization");
let nih = require("./nihForm");
let sdc = require("./sdcForm");
let odm = require("./odmForm");
let redCap = require("./redCapForm");
let publishForm = require("./publishForm");

function setResponseXmlHeader(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Content-Type", "application/xml");
}

function fetchWholeForm(form, callback) {
    let formOutdated = false;
    let maxDepth = 8;
    let depth = 0;
    let loopFormElements = function (f, cb) {
        if (!f) return cb();
        if (!f.formElements) f.formElements = [];
        async.forEachSeries(f.formElements, function (fe, doneOne) {
            if (fe.elementType === "form") {
                depth++;
                if (depth < maxDepth) {
                    let tinyId = fe.inForm.form.tinyId;
                    let version = fe.inForm.form.version;
                    mongo_form.byTinyIdAndVersion(tinyId, version, function (err, result) {
                        if (err) return cb("Retrieving form tinyId: " + fe.inForm.form.tinyId + " version: " + fe.inForm.form.version + " has error: " + err);
                        result = result.toObject();
                        fe.formElements = result.formElements;
                        loopFormElements(fe, function () {
                            depth--;
                            doneOne();
                        });
                    });
                } else doneOne();
            } else if (fe.elementType === "section") {
                loopFormElements(fe, doneOne);
            } else {
                let tinyId = fe.question.cde.tinyId;
                let version = fe.question.cde.version ? fe.question.cde.version : null;
                mongo_cde.byTinyId(tinyId, function (err, dataElement) {
                    if (err || !dataElement) cb(err);
                    else {
                        let systemDe = dataElement.toObject();
                        let systemDeVersion = systemDe.version ? systemDe.version : null;
                        if (!_.isEqual(version, systemDeVersion)) {
                            fe.question.cde.outdated = true;
                            formOutdated = true;
                        }
                        fe.question.cde.derivationRules = systemDe.derivationRules;
                        doneOne();
                    }
                });
            }
        }, function doneAll() {
            cb();
        });
    };
    if (!form) return callback();
    loopFormElements(form, function (err) {
        if (formOutdated) form.outdated = true;
        callback(err, form);
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
        if (err) return res.status(500).send("ERROR");
        if (!form) return res.status(404).send();
        form = form.toObject();
        fetchWholeForm(form, function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR");
                if (req.query.type === 'xml') {
                    setResponseXmlHeader(res);
                    if (req.query.subtype === 'odm')
                        odm.getFormOdm(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR");
                            res.setHeader("Content-Type", "text/xml");
                            return res.send(xmlForm);
                        });
                    else if (req.query.subtype === 'sdc')
                        sdc.formToSDC(wholeForm, req.query.renderer, function (err, sdcForm) {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                    else nih.getFormNih(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR");
                            return res.send(xmlForm);
                        });
                } else if (req.query.type && req.query.type.toLowerCase() === 'redcap')
                    redCap.getZipRedCap(wholeForm, res);
                else res.send(wholeForm);
            });
            mongo_data_system.addToViewHistory(wholeForm, req.user);
        });
    });
};

exports.priorForms = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send("ERROR");
        if (!form) res.status(404).send();
        mongo_form.byIdList(form.history, function (err, priorForms) {
            if (err) return res.status(500).send("ERROR");
            async.forEachSeries(priorForms, function (priorForm, doneOnePriorForm) {
                priorForm = priorForm.toObject();
                fetchWholeForm(priorForm, doneOnePriorForm);
            }, function doneAllPriorForms() {
                res.send(priorForms);
            });
        });
    });
};

exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) return res.status(500).send("ERROR");
        if (!form) return res.status(404).send();
        form = form.toObject();
        fetchWholeForm(form, function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR");
                if (req.query.type === 'xml') {
                    setResponseXmlHeader(res);
                    if (req.query.subtype === 'odm')
                        odm.getFormOdm(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR");
                            res.setHeader("Content-Type", "text/xml");
                            return res.send(xmlForm);
                        });
                    else if (req.query.subtype === 'sdc')
                        sdc.formToSDC(wholeForm, req.query.renderer, function (err, sdcForm) {
                            if (err) return res.send(err);
                            return res.send(sdcForm);
                        });
                    else nih.getFormNih(wholeForm, function (err, xmlForm) {
                            if (err) return res.status(500).send("ERROR");
                            return res.send(xmlForm);
                        });
                } else if (req.query.type && req.query.type.toLowerCase() === 'redcap')
                    redCap.getZipRedCap(wholeForm, res);
                else res.send(wholeForm);
            });
            mongo_data_system.addToViewHistory(wholeForm, req.user);
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
        form = form.toObject();
        fetchWholeForm(form, function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR");
            wipeRenderDisallowed(wholeForm, req, function (err) {
                if (err) return res.status(500).send("ERROR");
                res.send(wholeForm);
            });
        });
    });
};

exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_form.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send("ERROR");
        res.send(latestVersion);
    });
};

exports.publishForm = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(401).send("Not Authorized");
    mongo_form.byId(id, function (err, form) {
        form = form.toObject();
        fetchWholeForm(form, function (err, wholeForm) {
            if (err) return res.status(500).send("ERROR");
            publishForm.getFormForPublishing(wholeForm, req, res);
        });
    });
};

exports.createForm = function (req, res) {
    let id = req.params.id;
    if (id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    let user = req.user;
    authorization.allowCreate(user, elt, function (err) {
        if (err) return res.status(500).send("ERROR");
        mongo_form.create(elt, user, function (err, dataElement) {
            if (err) return res.status(500).send("ERROR");
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
        authorization.allowUpdate(user, item, function (err) {
            if (err) return res.status(500).send("ERROR");
            mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
                let allowedRegStatuses = ["Retired", "Incomplete", "Candidate"];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) return res.status(403).send("Not authorized"); else {
                    let elt = req.body;
                    mongo_form.trimWholeForm(elt);
                    mongo_form.update(elt, req.user, function (err, response) {
                        if (err) return res.status(500).send("ERROR");
                        res.send(response);
                    });
                }
            });
        });
    });
};

