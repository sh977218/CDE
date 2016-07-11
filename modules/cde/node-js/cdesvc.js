var mongo_data = require('./mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , deepDiff = require('deep-diff')
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

exports.diff = function(newCde, oldCde) {
    var newCdeObj = newCde.toObject?newCde.toObject():newCde;
    var oldCdeObj = oldCde.toObject?oldCde.toObject():oldCde;
  [newCdeObj, oldCdeObj].forEach(function(cde){
      delete cde._id;
      delete cde.updated;
      delete cde.updatedBy;
      delete cde.archived;
      delete cde.history;
      delete cde.changeNote;
      delete cde.__v;
      delete cde.views;
      delete cde.comments;
  });  
  return deepDiff(oldCdeObj, newCdeObj);
};

exports.hideProprietaryPvs = function(cdes, user) {      
    this.hiddenFieldMessage = 'Login to see the value.';
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
