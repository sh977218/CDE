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

exports.listcontexts = function(req, res) {
    mongo_data.listcontexts(function(err, contexts) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(contexts);
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

exports.name_autocomplete = function(req, res) {
    var search = req.query["search"]    
    if (search == "undefined" || search.name == "undefined") {
        res.send("");
    } else {
        mongo_data.name_autocomplete(JSON.parse(search), function(err, nameList) {
            if (err) {
                res.send("ERROR");
            } else {
                res.send({names: nameList});
            }
         });
    }
};
