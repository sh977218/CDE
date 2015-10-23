var config = require('config');

exports.createIndexJson = {
    "mappings": {
        "dataelement": {
            "properties": {
                "stewardOrg": {
                    "properties": {
                        "name": {"type": "string", "index": "not_analyzed"}
                    }
                }
                , "flatClassifications": {"type": "string", "index": "not_analyzed", "index_name": "flatClassification"}
                , "classification.stewardOrg.name": {"type": "string", "index": "not_analyzed"}
                , "registrationState.registrationStatus": {"type": "string", "index": "not_analyzed"}
                , "source" : { "type" : "string", "index" : "not_analyzed" }
                , "origin" : { "type" : "string", "index" : "not_analyzed" }
                , "valueDomain.permissibleValues.codeSystemName": { "type" : "string", "index" : "not_analyzed" }
                , "properties": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "key": {"type": "string"},
                        "value": {"type": "string"}
                    }
                }, "ids": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "source": {"type": "string"},
                        "id": {"type": "string"},
                        "version": {"type": "string"}
                    }
                }
                , "tinyId": {"type": "string", "index": "not_analyzed"}
                , "updated": {"type": "date", "index": "no"}
                , "updatedBy.username": {"type": "string", "index": "no"}
                , "changeNote": {"type": "string", "index": "no"}
                , "attachments.fileid": {"type": "string", "index": "no"}
                , "attachments.filename": {"type": "string", "index": "no"}
                , "_id": {"type": "string", "index": "no"}
                , "comments.text": {"type": "string", "index": "no"}
                , "comments.user": {"type": "string", "index": "no"}
                , "history": {"type": "string", "index": "no"}
                , "imported": {"type": "date", "index": "no"}
                , "naming.languageCode": {"type": "string", "index": "no"}
                , "naming.context.contextName": {"type": "string", "index": "no"}
                , "version": {"type": "string", "index": "no"}
            }
        }
    }
};

var storedQueryRiverFunction =
    "for (var i = 0; i < ctx.document.selectedElements1.length && i < 4; i++) {ctx.document['classifLevel' + i] = ctx.document.selectedElements1[i];} ctx.document.search_suggest = ctx.document.searchTerm";

var riverFunction =
    "if (ctx.operation !== 'd') {\
    if (ctx.document.archived) {ctx.deleted = true; return;}\
    function escapeHTML(s) {return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}\
     var flatArray = [];\
     function doClassif(currentString, classif) {\
        if (currentString.length > 0) {currentString = currentString + ';';}\
        currentString = currentString + classif.name;\
        flatArray.push(currentString);\
            if (classif.elements) {\
                for (var i = 0; i < classif.elements.length; i++) {\
                    doClassif(currentString, classif.elements[i]);\
                }\
            }\
     }\
    function flattenClassification(doc) {\
        if (doc.classification) {\
            for (var i = 0; i < doc.classification.length; i++) {\
                if (doc.classification[i].elements) {\
                    for (var j=0; j < doc.classification[i].elements.length; j++) {\
                        doClassif(doc.classification[i].stewardOrg.name, doc.classification[i].elements[j]);\
                    }\
                }\
            }\
        }\
    }\
    flattenClassification(ctx.document); \
    if (ctx.document.valueDomain && ctx.document.valueDomain.permissibleValues) {\
        ctx.document.valueDomain.nbOfPVs = ctx.document.valueDomain.permissibleValues.length;\
        if (ctx.document.valueDomain.permissibleValues.length > 20) {\
            ctx.document.valueDomain.permissibleValues.length = 20;\
        }\
    }\
    ctx.document.flatClassifications = flatArray; \
    ctx.document.stewardOrgCopy = ctx.document.stewardOrg;\
    ctx.document.steward = ctx.document.stewardOrg.name;\
    ctx.document.primaryNameCopy = ctx.document.naming?escapeHTML(ctx.document.naming[0].designation):'';\
    ctx.document.primaryDefinitionCopy = ctx.document.naming?escapeHTML(ctx.document.naming[0].definition):'';\
    var regStatusSortMap = {Retired: 6, Incomplete: 5, Candidate: 4, Recorded: 3, Qualified: 2, Standard: 1, \"Preferred Standard\": 0}; \
    ctx.document.registrationState.registrationStatusSortOrder = regStatusSortMap[ctx.document.registrationState.registrationStatus]; \
    if (ctx.document.classification) { \
        var size = ctx.document.classification.length; \
        if (size > 10) {ctx.document.classificationBoost = 2.1;} \
        else {ctx.document.classificationBoost = 0.1 + 0.2 * size;} \
    } else {ctx.document.classificationBoost = .1;}\
    ctx.document.flatIds = [];\
    if (ctx.document.ids) {\
        for (var i=0; i < ctx.document.ids.length; i++) {\
            ctx.document.flatIds.push(ctx.document.ids[i].source + ' ' + ctx.document.ids[i].id + ' ' + ctx.document.ids[i].version);\
        }\
    }\
    ctx.document.flatProperties = [];\
    if (ctx.document.properties) {\
        for (var i=0; i < ctx.document.properties.length; i++) {\
            ctx.document.flatProperties.push(ctx.document.properties[i].key + ' ' + ctx.document.properties[i].value);\
        }\
    }\
    if (ctx.document.forkOf) {ctx.document.isFork = true;}\
    }";


exports.createRiverJson = {
    "type": "mongodb",
    "mongodb": {
        "servers": config.database.servers,
        "credentials": [
            {"db": "admin", "user": config.database.dbUser, "password": config.database.dbPassword}
        ],
        "db": config.database.dbname,
        "collection": "dataelements",
        "script": riverFunction
    },
    "index": {
        "name": config.elastic.index.name,
        "type": "dataelement"
    }
};

exports.createFormIndexJson = {
    "mappings": {
        "form": {
            "properties": {
                "stewardOrg.name": {"type": "string", "index": "not_analyzed"}
                , "flatClassifications": {"type": "string", "index": "not_analyzed", "index_name": "flatClassification"}
                , "classification.stewardOrg.name": {"type": "string", "index": "not_analyzed"}
                , "registrationState.registrationStatus": {"type": "string", "index": "not_analyzed"}
                , "source": {"type": "string", "index": "not_analyzed"}
                , "origin": {"type": "string", "index": "not_analyzed"}
                , "properties": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "key": {"type": "string"},
                        "value": {"type": "string"}
                    }
                }, "ids": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "source": {"type": "string"},
                        "id": {"type": "string"},
                        "version": {"type": "string"}
                    }
                }
            }
        }
    }
};

exports.createFormRiverJson = {
    "type": "mongodb"
    , "mongodb": {
        "servers": config.database.servers
        , "credentials": [
            {"db": "admin", "user": config.database.dbUser, "password": config.database.dbPassword}
        ]
        , "db": config.database.dbname
        , "collection": "forms"
        , "script": riverFunction
    }
    , "index": {
        "name": config.elastic.formIndex.name
        , "type": "form"
    }
};

exports.createBoardIndexJson = {
    "mappings": {
        "board": {

        }
    }
};

exports.createBoardRiverJson = {
    "type": "mongodb"
    , "mongodb": {
        "servers": config.database.servers
        , "credentials": [
            {"db": "admin", "user": config.database.dbUser, "password": config.database.dbPassword}
        ]
        , "db": config.database.dbname
        , "collection": "pinningBoards"
    }
    , "index": {
        "name": config.elastic.boardIndex.name
        , "type": "board"
    }
};

exports.createStoredQueryIndexJson = {
    "mappings": {
        "storedquery": {
            "properties": {
                "selectedOrg1": {"type": "string", "index": "not_analyzed"}
                , "selectedOrg2": {"type": "string", "index": "not_analyzed"}
                , "selectedElements1": {"type": "string", "index": "not_analyzed"}
                , "selectedElements2": {"type": "string", "index": "not_analyzed"}
                , "regStatuses": {"type": "string", "index": "not_analyzed"}
                , "classifLevel0": {"type": "string", "index": "not_analyzed"}
                , "classifLevel1": {"type": "string", "index": "not_analyzed"}
                , "classifLevel2": {"type": "string", "index": "not_analyzed"}
                , "classifLevel3": {"type": "string", "index": "not_analyzed"}
                , "classifLevel4": {"type": "string", "index": "not_analyzed"}
                , "searchTerm": {"type": "string", "analyzer": "stop"}
                , "search_suggest": { "type" : "completion",
                    "index_analyzer" : "simple",
                    "search_analyzer" : "simple",
                    "payloads" : true
                }
            }
        }
    }
};

exports.createStoredQueryRiverJson = {
    "type": "mongodb"
    , "mongodb": {
        "servers": config.database.servers
        , "credentials": [
            {"db": "admin", "user": config.database.dbUser, "password": config.database.dbPassword}
        ]
        , "db": config.database.log.dbname
        , "collection": "storedqueries"
        , "script": storedQueryRiverFunction
    }
    , "index": {
        "name": config.elastic.storedQueryIndex.name
        , "type": "storedquery"
    }
};