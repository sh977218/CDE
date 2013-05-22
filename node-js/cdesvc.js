var express = require('express')
  , http = require('http')
  , mongo_data = require('./mongo-data')

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
            if (searchObj.longName) {
                var regex = new RegExp(searchObj.longName, 'i');
                searchObj.longName = regex;
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
}

exports.listcontexts = function(req, res) {
    mongo_data.listcontexts(function(err, contexts) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(contexts);
       }   
    }) 
}

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
        mongo_data.show(cdeId, function(err, cde) {
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
    return mongo_data.save(req, function(err, cde) {
        res.send(cde);            
    });
};  

exports.autocomplete = function(req, res) {
    var inValue = req.params.inValue;
    
    if (inValue == "undefined") {
        res.send("");
    } else {
        mongo_data.autocomplete(inValue, function (err, result) {
            if (err) {
                res.send("");
            } else {
                res.send(result);
            }
        });
    }
};