var config = require("../config.js");

exports.createIndexJson = {
    "settings" : {
        "number_of_shards" : 1
    },
    "mappings" : {
        "dataelement" : {
            "properties" : {
                "stewardOrg.name" : { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.elements.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.elements.elements.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.elements.elements.elements.elements.elements.name": { "type" : "string", "index" : "not_analyzed" }
                , "classification.stewardOrg.name": { "type" : "string", "index" : "not_analyzed" }
                , "origin" : { "type" : "string", "index" : "not_analyzed" }
            }
        }
    }
};

var riverFunction = 
    "var regStatusSortMap = {Retired: 6, Incomplete: 5, Candidate: 4, Recorded: 3, Qualified: 2, Standard: 1, \"Preferred Standard\": 0}; \
    ctx.document.registrationState.registrationStatusSortOrder = regStatusSortMap[ctx.document.registrationState.registrationStatus]; \
    if (ctx.document.classification) { \
        var size = ctx.document.classification.length; \
        if (size > 10) {ctx.document.classificationBoost = 2.1;} \
        else {ctx.document.classificationBoost = 0.1 + 0.2 * size;} \
    } else {ctx.document.classificationBoost = .1;}" ;

exports.createRiverJson = { 
    "type": "mongodb",
    "mongodb": {
        "servers": config.database.servers,
        "db": config.database.dbname, 
        "collection": "dataelements",
        "script": riverFunction
    },
    "index": {
        "name": config.elastic.index.name, 
        "type": "dataelement"                  
    }        
};