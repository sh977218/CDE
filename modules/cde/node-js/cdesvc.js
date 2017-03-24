var mongo_data = require('./mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , elastic = require('../../cde/node-js/elastic')
    ;

exports.forks = function(req, res) {
    var cdeId = req.params.id;

    if (!cdeId) {
        res.send("No Element Id");
    }
    mongo_data.forks(cdeId, function(err, forks) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(forks);
       }
    });
};


exports.priorCdes = function(req, res) {
    var cdeId = req.params.id;

    if (!cdeId) {
        res.send("No Data Element Id");
    }
    mongo_data.priorCdes(cdeId, function(err, priorCdes) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(priorCdes);
       }
    });
};

exports.byId = function (req, res) {
    mongo_data.byId(req.params.id, function (err, de) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(de);
        }
    })
};
exports.show = function(req, res, cb) {
    var cdeId = req.params.id;
    if (!cdeId) {
        res.send("No Data Element Id");
        return;
    }
    mongo_data.byId(cdeId, function(err, cde) {
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
    adminSvc.save(req, res, mongo_data, function() {
        elastic.fetchPVCodeSystemList();
    });
};

exports.hideProprietaryCodes = function(cdes, user) {
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
    this.censorPv = function(pvSet) {
        var toBeCensored = true;
        this.systemWhitelist.forEach(function(system) {
            if (!pvSet.codeSystemName) toBeCensored = false;
            else if (pvSet.codeSystemName.indexOf(system)>=0) toBeCensored = false;
        });
        if (toBeCensored) {
            pvSet.valueMeaningName = hiddenFieldMessage;
            pvSet.valueMeaningCode = hiddenFieldMessage;
            pvSet.codeSystemName = hiddenFieldMessage;
            pvSet.codeSystemVersion = hiddenFieldMessage;
        }
    };
    this.checkCde = function(cde) {
        adminSvc.hideProprietaryIds(cde);
        if (cde.valueDomain.datatype !== "Value List") return cde;
        var self = this;
        cde.valueDomain.permissibleValues.forEach(function(pvSet) {
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
    cdes.forEach(function(cde) {
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
