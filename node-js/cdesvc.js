var express = require('express')
  , request = require('request')
  , util = require('util')
  , mongo_data = require('./mongo-data')
  , envconfig = require('../envconfig.js')
;

var elasticUri = process.env.ELASTIC_URI || envconfig.elasticUri || 'http://localhost:9200/nlmcde/';

exports.elasticsearch = function(req, res) {
    var q = req.query["q"];
    var from = req.query["from"];
    var filter = req.query["filter"];

    var limit = 20;

    var queryStuff = {size: limit};
    
    if (q != undefined && q !== "") {
        queryStuff.query = 
            {   
                bool: {
                    should: {
                    function_score: {
                        script_score: {
                            script: "(6 - doc[\"registrationState.registrationStatusSortOrder\"].value) / 6.0"
                        }
                        , query: {
                            query_string: {
                                fields: ["_all", "naming.designation^3"]
                                , query: q
                            }
                        }
                    }
                    }
                    , must_not: {
                        term: {
                            "registrationState.registrationStatus": "retired"
                        }
                    }
                }
           };
    }
    
    queryStuff.facets = {
        orgs: {terms: {field: "stewardOrg.name", size: 20}}
        , statuses: {terms: {field: "registrationState.registrationStatus"}}
    };

    if (filter != undefined) {
        filter = JSON.parse(filter);
        if (filter.and.length !== 0) {
            queryStuff.filter = filter;
        }
    }
        
    if (from) {
        queryStuff.from = from;
    }

    request.post(elasticUri + "_search",{body: JSON.stringify(queryStuff)}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var resp = JSON.parse(body);
        var result = {cdes: []
            , pages: Math.ceil(resp.hits.total / limit)
            , page: Math.ceil(from/ limit)
            , totalNumber: resp.hits.total};
        for (var i = 0; i < resp.hits.hits.length; i++) {
            var thisCde = resp.hits.hits[i]._source;
            if (thisCde.valueDomain.permissibleValues.length > 10) {
                thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
            } 
            result.cdes.push(thisCde);
        }
        result.facets = resp.facets;
        res.send(result);
      }
    });  
};

exports.morelike = function(id, callback) {
    var from = 0;
    var limit = 20;

    request.get(elasticUri + "documents/" + id + "/_mlt", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var resp = JSON.parse(body);
            var result = {cdes: []
                , pages: Math.ceil(resp.hits.total / limit)
                , page: Math.ceil(from / limit)
                , totalNumber: resp.hits.total};
            for (var i = 0; i < resp.hits.hits.length; i++) {
                var thisCde = resp.hits.hits[i]._source;
                if (thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                } 
                result.cdes.push(thisCde);
            }
            callback(result);
        } else {
            callback("Error");
        }
        
    });
};

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
            // Following have no callback because it's no big deal if it fails.
            // So create new thread and move on.
            mongo_data.incDeView(cde); 
            if (req.isAuthenticated()) {
                console.log("add");
               mongo_data.addToViewHistory(cde, req.user);
            };
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
    if (req.isAuthenticated()) {
        if (!req.body._id) {
            return mongo_data.saveCde(req, function(err, savedCde) {
                res.send(savedCde);
            });
        } else {
            return mongo_data.cdeById(req.body._id, function(err, cde) {
                if (cde.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.indexOf(cde.stewardOrg.name) < 0 
                        && req.user.orgAdmin.indexOf(cde.stewardOrg.name) < 0 
                        && !req.user.siteAdmin) {
                    res.send("not authorized");
                } else {
                    if ((cde.registrationState.registrationStatus === "Standard" || cde.registrationState.registrationStatus === "Preferred Standard")
                            && !req.user.siteAdmin) {
                        res.send("This record is already standard.");
                    } else {
                        return mongo_data.saveCde(req, function(err, savedCde) {
                            res.send(savedCde);            
                        });
                    }
                }
            });
        }
    } else {
        res.send("You are not authorized to do this.");
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
                           if (dataElement.valueDomain.permissibleValues !== priorDe.valueDomain.permissibleValues) {
                               diff.before.permissibleValues = priorDe.valueDomain.permissibleValues;
                               diff.after.permissibleValues = dataElement.valueDomain.permissibleValues;                              
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
