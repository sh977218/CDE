var mongo_data = require('./mongo-cde')
    , mongo_cde = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , elastic = require('../../cde/node-js/elastic')
    , deValidator = require('../../cde/shared/deValidator')

;
exports.versionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_cde.versionByTinyId(tinyId, function (err, dataElement) {
        if (err) res.status(500).send();
        else res.send(dataElement.version);
    });
};
exports.versionById = function (req, res) {
    let id = req.params.id;
    mongo_cde.versionById(id, function (err, dataElement) {
        if (err) res.status(500).send();
        else res.send(dataElement.version);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    let version = req.params.version;
    mongo_cde.byTinyIdVersion(tinyId, version, function (err, dataElement) {
        if (err) res.status(500).send();
        else res.send(dataElement);
    });
};

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    else mongo_cde.byId(id, function (err, dataElement) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(dataElement, req.user);
            mongo_cde.incDeView(dataElement);
            res.send(dataElement);
        }
    });
};
exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    else mongo_cde.byTinyId(tinyId, function (err, dataElement) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(dataElement, req.user);
            mongo_cde.incDeView(dataElement);
            res.send(dataElement);
        }
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

exports.updateDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(500).send();
    else {
        if (req.isAuthenticated()) {
            let user = req.user;
            mongo_cde.eltByTinyId(tinyId, function (err, item) {
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
                                deValidator.wipeDatatype(elt);
                                mongo_cde.update(elt, req.user, function (err, response) {
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


exports.createDataElement = function (req, res) {
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
            else mongo_cde.create(elt, user, function (err, dataElement) {
                    if (err) res.status(500).send();
                    else res.send(dataElement);
                });
        } else res.status(403).send("You are not authorized to do this.");
    }
};


/* ---------- PUT NEW REST API Implementation above  ---------- */

exports.forks = function (req, res) {
    var cdeId = req.params.id;

    if (!cdeId) {
        res.send("No Element Id");
    }
    mongo_data.forks(cdeId, function (err, forks) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(forks);
        }
    });
};


exports.priorCdes = function (req, res) {
    var cdeId = req.params.id;

    if (!cdeId) {
        res.send("No Data Element Id");
    }
    mongo_data.priorCdes(cdeId, function (err, priorCdes) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(priorCdes);
        }
    });
};
exports.show = function (req, res, cb) {
    var cdeId = req.params.id;
    if (!cdeId) {
        res.send("No Data Element Id");
        return;
    }
    mongo_data.byId(cdeId, function (err, cde) {
        cb(cde);
        // Following have no callback because it's no big deal if it fails.
        if (cde) {
            mongo_data.incDeView(cde);
            if (req.isAuthenticated()) {
                mongo_data.addToViewHistory(cde, req.user);
            }
        }
    });
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_data, function () {
        elastic.fetchPVCodeSystemList();
    });
};

exports.hideProprietaryCodes = function (cdes, user) {
    var hiddenFieldMessage = 'Login to see the value.';
    this.systemWhitelist = [
        "RXNORM"
        , "HSLOC"
        , "CDCREC"
        , "SOP"
        , "AHRQ"
        , "HL7"
        , "CDC Race and Ethnicity"
        , "NCI"
        , "UMLS"
    ];
    this.censorPv = function (pvSet) {
        var toBeCensored = true;
        this.systemWhitelist.forEach(function (system) {
            if (!pvSet.codeSystemName) toBeCensored = false;
            else if (pvSet.codeSystemName.indexOf(system) >= 0) toBeCensored = false;
        });
        if (toBeCensored) {
            pvSet.valueMeaningName = hiddenFieldMessage;
            pvSet.valueMeaningCode = hiddenFieldMessage;
            pvSet.codeSystemName = hiddenFieldMessage;
            pvSet.codeSystemVersion = hiddenFieldMessage;
        }
    };
    this.checkCde = function (cde) {
        adminSvc.hideProprietaryIds(cde);
        if (cde.valueDomain.datatype !== "Value List") return cde;
        var self = this;
        cde.valueDomain.permissibleValues.forEach(function (pvSet) {
            self.censorPv(pvSet);
        });
        return cde;
    };
    if (!cdes) return cdes;
    if (user) return cdes;
    if (!Array.isArray(cdes)) {
        return this.checkCde(cdes);
    }
    var self = this;
    cdes.forEach(function (cde) {
        self.checkCde(cde);
    });
    return cdes;
};


exports.checkEligibleToRetire = function (req, res, elt, cb) {
    if (!req.isAuthenticated())
        res.status(403).send("You are not authorized to do this.");
    if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0
        && req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0
        && !req.user.siteAdmin) {
        res.status(403).send("Not authorized");
    } else {
        if ((elt.registrationState.registrationStatus === "Standard" ||
            elt.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin) {
            res.status(403).send("This record is already standard.");
        } else {
            if ((elt.registrationState.registrationStatus !== "Standard" && elt.registrationState.registrationStatus !== " Preferred Standard") &&
                (elt.registrationState.registrationStatus === "Standard" ||
                elt.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin
            ) {
                res.status(403).send("Not authorized");
            } else {
                cb();
            }
        }
    }
};
