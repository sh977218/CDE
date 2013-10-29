var express = require('express')
  , http = require('http')
  , mongo_data = require('./mongo-data')
;

exports.listcde = function(req, res) {
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

    mongo_data.cdelist(from, pagesize, searchObj, function(err, cdelist) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(cdelist);
       }
    });
};

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
}

exports.listOrgs = function(req, res) {
    mongo_data.listOrgs(function(err, orgs) {
       if (err) {
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

exports.show = function(req, res) {
    var cdeId = req.params.id;
    
    if (!cdeId) {
        res.send("No Data Element Id");
    } else {
        mongo_data.cdeById(cdeId, function(err, cde) {
           res.send(cde); 
        });
    }
};

exports.linktovsac = function(req, res) {
    return mongo_data.linktovsac(req, function(err, cde) {
        res.send(cde);
    });
};

exports.save = function (req, res) {
    return mongo_data.saveCde(req, function(err, cde) {
        res.send(cde);            
    });
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
                               diff.before.name = priorDe.naming[0].designation;
                               diff.after.name = dataElement.naming[0].designation;
                           }
                           if (dataElement.naming[0].definition !== priorDe.naming[0].definition) {
                               diff.before.definition = priorDe.naming[0].definition;
                               diff.after.definition = dataElement.naming[0].definition;
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
