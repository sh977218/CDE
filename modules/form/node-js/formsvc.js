var mongo_form = require('./mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data');

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