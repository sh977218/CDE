let xml2js = require('xml2js');
let js2xml = require('js2xmlparser');
let mongo_data = require('./mongo-cde');
let mongo_cde = require('./mongo-cde');
let mongo_data_system = require('../../system/node-js/mongo-data');
let adminSvc = require('../../system/node-js/adminItemSvc.js');
let elastic = require('../../cde/node-js/elastic');
let deValidator = require('../../cde/shared/deValidator');
let vsac = require('./vsac-io');
let exportShared = require('../../system/shared/exportShared');

function allowUpdate(user, item, cb) {
    if (item.archived === true)
        return cb("Element is archived.");
    if (user.orgCurator.indexOf(item.stewardOrg.name) < 0 && user.orgAdmin.indexOf(item.stewardOrg.name) < 0 && !user.siteAdmin)
        return cb("Not authorized");
    if ((item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard") && !user.siteAdmin)
        return cb("This record is already standard.");
    if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") && (item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard") && !user.siteAdmin)
        return cb("Not authorized");
    else return cb();
}

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_cde.byId(id, function (err, dataElement) {
        if (err) return res.status(500).send(err);
        if (!dataElement) return res.status(404).send();
        if (!req.user) hideProprietaryCodes(dataElement);
        if (req.query.type === 'xml') {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.setHeader("Content-Type", "application/xml");
            let cde = dataElement.toObject();
            return res.send(js2xml("dataElement", exportShared.stripBsonIds(cde)));
        }
        res.send(dataElement);
        mongo_data.incDeView(dataElement);
        mongo_data_system.addToViewHistory(dataElement, req.user);
    });
};

exports.priorDataElements = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_cde.byId(id, function (err, dataElement) {
        if (err) return res.status(500).send(err);
        if (!dataElement) return res.status(404).send();
        mongo_data.byIdList(dataElement.history, function (err, priorDataElements) {
            if (err) return res.status(500).send(err);
            res.send(priorDataElements);
        });
    });
};

exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_cde.byTinyId(tinyId, function (err, dataElement) {
        if (err) return res.status(500).send(err);
        if (!dataElement) return res.status(404).send();
        if (!req.user) hideProprietaryCodes(dataElement);
        if (req.query.type === 'xml') {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.setHeader("Content-Type", "application/xml");
            let cde = dataElement.toObject();
            return res.send(js2xml("dataElement", exportShared.stripBsonIds(cde)));
        }
        res.send(dataElement);
        mongo_data.incDeView(dataElement);
        mongo_data_system.addToViewHistory(dataElement, req.user);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_cde.byTinyIdVersion(tinyId, version, function (err, dataElement) {
        if (err) return res.status(500).send(err);
        if (!dataElement) return res.status(404).send();
        res.send(dataElement);
    });
};

exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_cde.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send(err);
        res.send(latestVersion);
    });
};

exports.createDataElement = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("You are not authorized to do this.");
    let elt = req.body;
    let user = req.user;
    if (!elt.stewardOrg.name) return res.send("Missing Steward");
    if (user.orgCurator.indexOf(elt.stewardOrg.name) < 0 && user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !user.siteAdmin)
        return res.status(403).send("not authorized");
    if (elt.registrationState && elt.registrationState.registrationStatus && ((elt.registrationState.registrationStatus === "Standard" || elt.registrationState.registrationStatus === " Preferred Standard") && !user.siteAdmin))
        return res.status(403).send("Not authorized");
    mongo_cde.create(elt, user, function (err, dataElement) {
        if (err) return res.status(500).send(err);
        res.send(dataElement);
    });
};

exports.updateDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("You are not authorized to do this.");
    mongo_cde.byTinyId(tinyId, function (err, item) {
        if (err) return res.status(500).send(err);
        if (!item) return res.status(404).send();
        allowUpdate(req.user, item, function (err) {
            if (err) return res.status(500).send(err);
            mongo_data_system.orgByName(item.stewardOrg.name, function (org) {
                let allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1)
                    return res.status(403).send("You are not authorized to do this.");
                let elt = req.body;
                deValidator.wipeDatatype(elt);
                mongo_cde.update(elt, req.user, function (err, response) {
                    if (err) return res.status(500).send(err);
                    res.send(response);
                });
            });
        });
    });
};

let parser = new xml2js.Parser();
exports.vsacId = function (req, res) {
    if (!req.user) return res.status(202).send({error: {message: "Please login to see VSAC mapping."}});
    vsac.getValueSet(req.params.vsacId, function (err, result) {
        if (result.statusCode === 404 || result === 400)
            return res.status(500).end();
        parser.parseString(result.body, function (err, jsonResult) {
            res.send(jsonResult);
        });
    });
};

exports.viewHistory = function (req, res) {
    if (!req.user) return res.send("You must be logged in to do that");
    let splicedArray = req.user.viewHistory.splice(0, 10);
    let tinyIdList = [];
    for (let i = 0; i < splicedArray.length; i++) {
        if (tinyIdList.indexOf(splicedArray[i]) === -1)
            tinyIdList.push(splicedArray[i]);
    }
    mongo_cde.byTinyIdList(tinyIdList, function (err, dataElements) {
        if (err) return res.status(500).send(err);
        dataElements.forEach(de => hideProprietaryCodes(de, req.user));
        return res.send(dataElements);
    });
};

/* ---------- PUT NEW REST API Implementation above  ---------- */

exports.show = function (req, res, cb) {
    var cdeId = req.params.id;
    if (!cdeId) return res.send("No Data Element Id");
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

var hideProprietaryCodes = function (cdes, user) {
    var hiddenFieldMessage = 'Login to see the value.';
    this.systemWhitelist = ["RXNORM", "HSLOC", "CDCREC", "SOP", "AHRQ", "HL7", "CDC Race and Ethnicity", "NCI", "UMLS"];
    this.censorPv = function (pvSet) {
        var toBeCensored = true;
        this.systemWhitelist.forEach(function (system) {
            if (!pvSet.codeSystemName) toBeCensored = false; else if (pvSet.codeSystemName.indexOf(system) >= 0) toBeCensored = false;
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

exports.hideProprietaryCodes = hideProprietaryCodes;


exports.checkEligibleToRetire = function (req, res, elt, cb) {
    if (!req.isAuthenticated()) res.status(403).send("You are not authorized to do this.");
    if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0 && req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !req.user.siteAdmin) {
        res.status(403).send("Not authorized");
    } else {
        if ((elt.registrationState.registrationStatus === "Standard" || elt.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin) {
            res.status(403).send("This record is already standard.");
        } else {
            if ((elt.registrationState.registrationStatus !== "Standard" && elt.registrationState.registrationStatus !== " Preferred Standard") && (elt.registrationState.registrationStatus === "Standard" || elt.registrationState.registrationStatus === "Preferred Standard") && !req.user.siteAdmin) {
                res.status(403).send("Not authorized");
            } else {
                cb();
            }
        }
    }
};
