const xml2js = require('xml2js');
const js2xml = require('js2xmlparser');
const mongo_cde = require('./mongo-cde');
const mongo_data = require('../system/mongo-data');
const authorization = require("../system/authorization");
const adminSvc = require('../system/adminItemSvc.js');
const elastic = require('./elastic');
const deValidator = require('@std/esm')(module)('../../shared/de/deValidator');
const vsac = require('./vsac-io');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const dbLogger = require('../system/dbLogger');

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_cde.byId(id, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - cannot query CDE by Id");
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
        mongo_cde.inCdeView(dataElement);
        mongo_data.addCdeToViewHistory(dataElement, req.user);
    });
};

exports.priorDataElements = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_cde.byId(id, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - Cannot get prior DEs");
        if (!dataElement) return res.status(404).send();
        let history = dataElement.history.concat([dataElement._id]).reverse();
        mongo_cde.DataElement.find({}, {
            "updatedBy.username": 1,
            updated: 1,
            "changeNote": 1,
            version: 1,
            elementType: 1
        }).where("_id").in(history).exec((err, priorDataElements) => {
            if (err) return res.status(500).send("ERROR - Cannot get prior DE list");
            mongo_data.sortArrayByArray(priorDataElements, history);
            res.send(priorDataElements)
        });
    });
};

exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_cde.byTinyId(tinyId, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - cannot get CDE by tinyId");
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
        mongo_cde.inCdeView(dataElement);
        mongo_data.addCdeToViewHistory(dataElement, req.user);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_cde.byTinyIdVersion(tinyId, version, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - cannot get CDE by tinyId / Version");
        if (!dataElement) return res.status(404).send();
        res.send(dataElement);
    });
};

exports.byTinyIdAndVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let version = req.params.version;
    mongo_cde.byTinyIdAndVersion(tinyId, version, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - cannot get CDE by tinyId / Version");
        if (!dataElement) return res.status(404).send();
        res.send(dataElement);
    });
};

exports.draftDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_cde.draftDataElement(tinyId, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - get draft data element. " + tinyId);
        res.send(dataElement);
    });
};
exports.draftDataElementById = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).send();
    mongo_cde.draftDataElementById(id, function (err, dataElement) {
        if (err) return res.status(500).send("ERROR - get draft data element. " + tinyId);
        res.send(dataElement);
    });
};

exports.saveDraftDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    let elt = req.body;
    if (elt.tinyId !== tinyId) return res.status(400).send();
    if (req.user && req.user.username) elt.updatedBy.username = req.user.username;
    if (!elt.created) elt.created = new Date();
    elt.updated = new Date();
    mongo_cde.saveDraftDataElement(elt, function (err, dataElement) {
        if (err) {
            dbLogger.logError({
                message: "Error saving draft: " + tinyId,
                origin: "cdeSvc.saveDraftDataElement",
                stack: err,
                details: ""
            });
            return res.status(500).send("ERROR - save draft data element. " + tinyId);
        }
        res.send(dataElement);
    });
};

exports.deleteDraftDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    mongo_cde.deleteDraftDataElement(tinyId, function (err) {
        if (err) return res.status(500).send("ERROR - delete draft data element. " + tinyId);
        res.send();
    });
};

exports.byTinyIdList = function (req, res) {
    let tinyIdList = req.params.tinyIdList;
    if (!tinyIdList) return res.status(400).send();
    tinyIdList = tinyIdList.split(",");
    mongo_cde.byTinyIdList(tinyIdList, function (err, dataElements) {
        if (err) return res.status(500).send("ERROR - Cannot get De by idlist");
        res.send(dataElements.map(mongo_data.formatElt));
    });
};

exports.latestVersionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_cde.latestVersionByTinyId(tinyId, function (err, latestVersion) {
        if (err) return res.status(500).send("ERROR - cannot get latest de by tinyId");
        res.send(latestVersion);
    });
};

exports.createDataElement = function (req, res) {
    let id = req.params.id;
    if (id) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("You are not authorized to do this.");
    let elt = req.body;
    let user = req.user;
    authorization.allowCreate(user, elt, function (err) {
        if (err) return res.status(500).send("ERROR - create cde - cannot allow");
        mongo_cde.create(elt, user, function (err, dataElement) {
            if (err) return res.status(500).send("ERROR - create cde");
            res.send(dataElement);
        });
    });
};

exports.updateDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    let elt = req.body;
    authorization.allowUpdate(req.user, elt, function (err) {
        if (err) return res.status(500).send("ERROR - update - cannot allow");
        deValidator.wipeDatatype(elt);
        mongo_data.orgByName(elt.stewardOrg.name, function (err, org) {
            let allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
            if (org && org.workingGroupOf && org.workingGroupOf.length > 0
                && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
                return res.status(403).send("Not authorized");
            }
            mongo_cde.update(elt, req.user, function (err, response) {
                if (err) return res.status(500).send("ERROR - cannot update de");
                mongo_cde.deleteDraftDataElement(elt.tinyId, err => {
                    if (err) return res.status(500).send("ERROR - cannot delete draft. ");
                    res.send(response);
                });
            });
        });
    });
};
exports.publishDataElement = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) return res.status(400).send();
    if (!req.isAuthenticated()) return res.status(403).send("Not authorized");
    mongo_cde.byTinyId(tinyId, function (err, item) {
        if (err) return res.status(500).send("ERROR - update find by tinyId");
        if (!item) return res.status(404).send();
        authorization.allowUpdate(req.user, item, function (err) {
            if (err) return res.status(500).send("ERROR - update - cannot allow");
            mongo_data.orgByName(item.stewardOrg.name, function (err, org) {
                let allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
                if (org && org.workingGroupOf && org.workingGroupOf.length > 0
                    && allowedRegStatuses.indexOf(item.registrationState.registrationStatus) === -1) {
                    return res.status(403).send("Not authorized");
                }
                let elt = req.body;
                elt.classification = item.classification;
                elt.attachments = item.attachments;
                deValidator.wipeDatatype(elt);
                mongo_cde.update(elt, req.user, function (err, response) {
                    if (err) return res.status(500).send("ERROR - cannot update de");
                    mongo_cde.deleteDraftDataElement(elt.tinyId, err => {
                        if (err) return res.status(500).send("ERROR - cannot delete draft. ");
                        res.send(response);
                    });
                });
            });
        });
    });
};

let parser = new xml2js.Parser();
exports.vsacId = function (req, res) {
    if (!req.user) return res.status(202).send({error: {message: "Please login to see VSAC mapping."}});
    vsac.getValueSet(req.params.vsacId, dbLogger.handleGenericError(
        {res: res, message: 'Error retrieving from VSAC', origin: "vsacId"}, result => {
            if (result.statusCode === 404 || result === 400) return res.status(404).end();
            parser.parseString(result.body, dbLogger.handleGenericError(
                {res: res, message: 'Error parsing from VSAC', origin: "vsacId"}, jsonResult => {
                    res.send(jsonResult);
            }));
    }));
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
        if (err) return res.status(500).send("ERROR - cannot view history id list");
        dataElements.forEach(de => hideProprietaryCodes(de, req.user));
        return res.send(dataElements);
    });
};

/* ---------- PUT NEW REST API Implementation above  ---------- */

exports.show = function (req, res, cb) {
    let cdeId = req.params.id;
    if (!cdeId) return res.send("No Data Element Id");
    mongo_cde.byId(cdeId, function (err, cde) {
        cb(cde);
        // Following have no callback because it's no big deal if it fails.
        if (cde) {
            mongo_cde.inCdeView(cde);
            if (req.isAuthenticated()) {
                mongo_cde.addCdeToViewHistory(cde, req.user);
            }
        }
    });
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_cde, function () {
        elastic.fetchPVCodeSystemList();
    });
};

var hideProprietaryCodes = function (cdes, user) {
    let hiddenFieldMessage = 'Login to see the value.';
    this.systemWhitelist = ["RXNORM", "HSLOC", "CDCREC", "SOP", "AHRQ", "HL7", "CDC Race and Ethnicity", "NCI", "UMLS"];
    this.censorPv = function (pvSet) {
        var toBeCensored = true;
        this.systemWhitelist.forEach(function (system) {
            if (!pvSet.codeSystemName || pvSet.codeSystemName.indexOf(system) >= 0)
                toBeCensored = false;
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
        if ((elt.registrationState.registrationStatus === "Standard" ||
            elt.registrationState.registrationStatus === "Preferred Standard") &&
            !req.user.siteAdmin) {
            res.status(403).send("This record is already standard.");
        } else {
            if ((elt.registrationState.registrationStatus !== "Standard" &&
                elt.registrationState.registrationStatus !== " Preferred Standard") &&
                (elt.registrationState.registrationStatus === "Standard" ||
                    elt.registrationState.registrationStatus === "Preferred Standard") &&
                !req.user.siteAdmin) {
                res.status(403).send("Not authorized");
            } else {
                cb();
            }
        }
    }
};
