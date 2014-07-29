var express = require('express')
  , request = require('request')
  , util = require('util')
  , mongo_data = require('./mongo-data')
  , logging = require('./logging.js')
;

var cdesvc = this;

exports.listform = function(req, res) {
    var from = req.query["from"],
        pagesize = req.query["pagesize"],
        search = req.query["search"];
   
    if (!from) {
        from = 0;
    }
    if (!pagesize) {
        pagesize = 20;
    }
    if (search == 'undefined') {
        search = "";
    } else {
        var searchObj;
        if (search) {
            searchObj = JSON.parse(search);
            if (searchObj.name) {
                var regex = new RegExp(searchObj.name, 'i');
                searchObj.name = regex;
            }
        }
    }

    mongo_data.formlist(from, pagesize, searchObj, function(err, formlist) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(formlist);
       }
    });
};

exports.listOrgs = function(req, res) {
    mongo_data.listOrgs(function(err, orgs) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(orgs);
       }   
    });
};

exports.listOrgsLongName = function(req, res) {
    mongo_data.listOrgsLongName(function(err, orgs) {
       if (err) {
           logging.expressErrorLogger.error(JSON.stringify({msg: err.stack}));
           res.send("ERROR");
       } else {
           res.send(orgs);
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

exports.show = function(req, cb) {
    var cdeId = req.params.id;
    var type = req.params.type;
    if (!cdeId) {
        res.send("No Data Element Id");
        return;
    }
    if (type!=='uuid') {
        mongo_data.cdeById(cdeId, function(err, cde) {
            // Following have no callback because it's no big deal if it fails.
            // So create new thread and move on.
            mongo_data.incDeView(cde); 
            if (req.isAuthenticated()) {
               mongo_data.addToViewHistory(cde, req.user);
            };
            cb(cde);
        }); 
    } else {
        mongo_data.cdesByUuidList([cdeId], function(err, cdes) {
            cb(cdes[0]);
        });    
    }    
};

exports.save = function (req, res) {
    if (req.isAuthenticated()) {
        if (!req.body._id) {
            if (!req.body.stewardOrg.name) {
                res.send("Missing Steward");
            } else {
                if (req.user.orgCurator.indexOf(req.body.stewardOrg.name) < 0 
                            && req.user.orgAdmin.indexOf(req.body.stewardOrg.name) < 0 
                            && !req.user.siteAdmin) {
                    res.send(403, "not authorized");
                } else {
                    return mongo_data.saveCde(req, function(err, savedCde) {
                        res.send(savedCde);
                    });
                }
            }
        } else {
            return mongo_data.cdeById(req.body._id, function(err, cde) {
                if (cde.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.indexOf(cde.stewardOrg.name) < 0 
                        && req.user.orgAdmin.indexOf(cde.stewardOrg.name) < 0 
                        && !req.user.siteAdmin) {
                    res.send(403, "not authorized");
                } else {
                    if ((cde.registrationState.registrationStatus === "Standard" || cde.registrationState.registrationStatus === "Preferred Standard")
                            && !req.user.siteAdmin) {
                        res.send("This record is already standard.");
                    } else {
                        if ((cde.registrationState.registrationStatus !== "Standard"  && cde.registrationState.registrationStatus !== " Preferred Standard") && 
                                (req.body.registrationState.registrationStatus === "Standard" || req.body.registrationState.registrationStatus === "Preferred Standard")
                                    && !req.user.siteAdmin
                                ) 
                        {
                            res.send(403, "not authorized");
                        } else {
                            return mongo_data.saveCde(req, function(err, savedCde) {
                                res.send(savedCde);            
                            });
                        }
                    }
                }
            });
        }
    } else {
        res.send(403, "You are not authorized to do this.");
    }
};  

exports.name_autocomplete = function(name, res) {
    if (name == "undefined") {
        res.send("");
    } else {
        mongo_data.name_autocomplete(name, function(err, nameList) {
            if (err) {
                res.send("ERROR");
            } else {
                res.send(nameList);
            }
        });
    }
};

exports.name_autocomplete_form = function(req, res) {
    var search = req.query["search"]    
    if (search == "undefined" || search.name == "undefined") {
        res.send("");
    } else {
        mongo_data.name_autocomplete_form(JSON.parse(search), function(err, nameList) {
            if (err) {
                res.send("ERROR");
            } else {
                res.send(namelist);
            }
         });
    }
};

function arrayEquals(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
            return false;
        }
    }
    return true;
}

exports.setDiff2 = function(dataElement, priorDe, property, diff) {
    if (!arrayEquals(dataElement[property.first][property.second], priorDe[property.first][property.second])) {
        diff.before[property.first] = {};
        diff.after[property.first] = {};
        diff.before[property.first][property.second] = priorDe[property.first][property.second];
        diff.after[property.first][property.second] = dataElement[property.first][property.second];                             
    }    
};

exports.diff = function(req, res) {
    if (req.params.deId == "undefined") {
        res.send("Please specify an identifier as input.");
    } else {
        mongo_data.cdeById(req.params.deId, function (err, dataElement) {
           if (err) {
               res.send("Error: " + err);
           } else {
               if (!dataElement) {
                   res.send("Cannot retrieve element with this ID.");
               } else {
                   if (dataElement.history.length > 0) {
                       mongo_data.cdeById(dataElement.history[dataElement.history.length - 1], function (err, priorDe) {
                           var diff = {};
                           diff.before = {};
                           diff.after = {};
                           
                           if (dataElement.naming[0].designation !== priorDe.naming[0].designation) {
                               diff.before.primaryName = priorDe.naming[0].designation;
                               diff.after.primaryName = dataElement.naming[0].designation;
                           }
                           if (dataElement.naming[0].definition !== priorDe.naming[0].definition) {
                               diff.before.primaryDefinition = priorDe.naming[0].definition;
                               diff.after.primaryDefinition = dataElement.naming[0].definition;
                           }
                           if (!arrayEquals(priorDe.naming.slice(), dataElement.naming.slice())) {
                               diff.before.naming = priorDe.naming;
                               diff.after.naming = dataElement.naming;
                           }                           
                           if (dataElement.version !== priorDe.version) {
                               diff.before.version = priorDe.version;
                               diff.after.version = dataElement.version;
                           }
                           if (dataElement.valueDomain.uom !== priorDe.valueDomain.uom) {
                               diff.before.uom = priorDe.valueDomain.uom;
                               if (!diff.before.uom) {diff.before.uom = "None Specified";}
                               diff.after.uom = dataElement.valueDomain.uom;
                               if (!diff.after.uom) {diff.after.uom = "None Specified";}
                           }
                           if (dataElement.valueDomain.datatype !== priorDe.valueDomain.datatype) {
                               diff.before.datatype = priorDe.valueDomain.datatype;
                               if (!diff.before.datatype) {diff.before.datatype = "None Specified";}
                               diff.after.datatype = dataElement.valueDomain.datatype;
                               if (!diff.after.datatype) {diff.after.datatype = "None Specified";}
                           }
                           if (!arrayEquals(dataElement.valueDomain.permissibleValues, priorDe.valueDomain.permissibleValues)) {
                               diff.before.permissibleValues = priorDe.valueDomain.permissibleValues;
                               diff.after.permissibleValues = dataElement.valueDomain.permissibleValues;                              
                           }
                           if (JSON.stringify(dataElement.registrationState) !== JSON.stringify(priorDe.registrationState)) {
                               diff.before.registrationState = priorDe.registrationState;
                               diff.after.registrationState = dataElement.registrationState;
                           }                           
                           cdesvc.setDiff2(dataElement, priorDe, {first: "property", second: "concepts"}, diff);                           
                           cdesvc.setDiff2(dataElement, priorDe, {first: "objectClass", second: "concepts"}, diff);
                           cdesvc.setDiff2(dataElement, priorDe, {first: "dataElementConcept", second: "concepts"}, diff);    
                           if (JSON.stringify(dataElement.ids) !== JSON.stringify(priorDe.ids)) {
                               diff.before.ids = priorDe.ids;
                               diff.after.ids = dataElement.ids;                               
                           }
                           res.send(diff);
                           
                       });
                   } else {
                       res.send("This element has no history");
                   }
               }
           }
        });
    }
};

exports.hideProprietaryPvs = function(cdes, user) {  
    this.hiddenFieldMessage = 'Login to see the value.';
    this.systemWhitelist = [
        "LOINC"
        , "RXNORM"
        , "HSLOC"
        , "CDCREC"
        , "SOP"
        , "AHRQ"
        , "HL7"
        , "CDC Race and Ethnicity"  
        , "NCI"
    ];
    this.censorPv = function(pvSet) {
        var toBeCensored = true;
        this.systemWhitelist.forEach(function(system) {
            if (!pvSet.codeSystemName) toBeCensored = false;            
            else if (pvSet.codeSystemName.indexOf(system)>=0) toBeCensored = false;            
        });
        if (toBeCensored) {
            pvSet.valueMeaningName = this.hiddenFieldMessage;
            pvSet.valueMeaningCode = this.hiddenFieldMessage;
            pvSet.codeSystemName = this.hiddenFieldMessage;
            pvSet.codeSystemVersion = this.hiddenFieldMessage;
        }
    };
    this.checkCde = function(cde) {
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