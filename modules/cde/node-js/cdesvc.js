var express = require('express')
  , request = require('request')
  , util = require('util')
  , mongo_data = require('./mongo-cde')
  , logging = require('../../system/node-js/logging.js') //TODO: USE DEPENDENCY INJECTION
  , adminSvc = require('../../system/node-js/adminItemSvc.js')
  , deepDiff = require('deep-diff')
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

exports.show = function(req, cb) {
    var cdeId = req.params.id;
    if (!cdeId) {
        res.send("No Data Element Id");
        return;
    }
    mongo_data.byId(cdeId, function(err, cde) {
        // Following have no callback because it's no big deal if it fails.
        // So create new thread and move on.
        mongo_data.incDeView(cde); 
        if (req.isAuthenticated()) {
           mongo_data.addToViewHistory(cde, req.user);
        };
        cb(cde);
    }); 
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_data);
};  

exports.name_autocomplete = function(name, res) {
    if (name === "undefined") {
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
    var search = req.query["search"];    
    if (search === "undefined" || search.name === "undefined") {
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

exports.diff = function(newCde, oldCde) {
  if (newCde.toObject) var newCdeObj = newCde.toObject();
  else var newCdeObj = newCde;
  if (oldCde.toObject) var oldCdeObj = oldCde.toObject();
  else var oldCdeObj = oldCde;
  [newCdeObj, oldCdeObj].forEach(function(cde){
      delete cde._id;
      delete cde.updated;
      delete cde.updatedBy;
      delete cde.version;
      delete cde.archived;
      delete cde.history;
      delete cde.__v;
      delete cde.views;
      delete cde.comments;
  });  
  return deepDiff(newCdeObj, oldCdeObj);
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