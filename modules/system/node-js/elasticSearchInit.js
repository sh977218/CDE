var config = require('config'),
    hash = require("crypto");


exports.createIndexJson = {
    "mappings": {
        "dataelement": {
            "properties": {
                "stewardOrg": {
                    "properties": {
                        "name": {"type": "string", "index": "not_analyzed"}
                    }
                }
                , "flatClassifications": {"type": "string", "index": "not_analyzed"}
                , "classification": {
                    properties: {
                        "stewardOrg": {
                            properties: {
                                "name": {"type": "string", "index": "not_analyzed"}
                            }
                        }
                    }
                }
                , "registrationState": {
                    properties: {
                        "registrationStatus": {"type": "string", "index": "not_analyzed"}
                    }
                }
                , "source": {"type": "string", "index": "not_analyzed"}
                , "origin": {"type": "string", "index": "not_analyzed"}
                , "valueDomain": {
                    properties: {
                        "permissibleValues": {
                            properties: {
                                "codeSystemName": {"type": "string", "index": "not_analyzed"}
                            }
                        }
                    }
                }
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
                , "updatedBy": {properties: {"username": {"type": "string", "index": "no"}}}
                , "changeNote": {"type": "string", "index": "no"}
                , "attachments": {
                    properties: {
                        "fileid": {"type": "string", "index": "no"},
                        "filename": {"type": "string", "index": "no"}
                    }
                }
                , "comments": {
                    properties: {
                        "text": {"type": "string", "index": "no"}
                        , "user": {"type": "string", "index": "no"}
                    }
                }
                , "history": {"type": "string", "index": "no"}
                , "imported": {"type": "date", "index": "no"}
                , "naming": {
                    properties: {
                        "languageCode": {"type": "string", "index": "no"},
                        "context": {
                            properties: {
                                "contextName": {"type": "string", "index": "no"}
                            }
                        }
                    }
                }
                , "version": {"type": "string", "index": "no"}
            }
        }
    }, settings: {
        index: {
            analysis: {
                analyzer: {
                    default: {
                        type: 'snowball'
                        , language: 'English'
                    }
                }
            }
        }
    }
};


exports.createFormIndexJson = {
    "mappings": {
        "form": {
            "properties": {
                "stewardOrg": {properties: {"name": {"type": "string", "index": "not_analyzed"}}}
                , "flatClassifications": {"type": "string", "index": "not_analyzed"}
                , "classification": {
                    properties: {
                        "stewardOrg": {
                            "properties": {
                                "name": {"type": "string", "index": "not_analyzed"}
                            }
                        }
                    }
                }
                , "registrationState": {
                    properties: {
                        "registrationStatus": {"type": "string", "index": "not_analyzed"}
                    }
                }
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
                }, "views": {"type": "integer"}
                , "numQuestions": {"type": "integer"}
            }
        }
    }
};

exports.storedQueryRiverFunction = function (elt) {
    elt.selectedElements1.forEach(function (se, i) {
        elt['classifLevel' + i] = se;
    });
    elt.search_suggest = elt.searchTerm;
    return elt;
};

exports.riverFunction = function (elt) {
    if (elt.archived) return null;

    function escapeHTML(s) {
        return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var flatArray = [];

    function doClassif(currentString, classif) {
        if (currentString.length > 0) {
            currentString = currentString + ';';
        }
        currentString = currentString + classif.name;
        flatArray.push(currentString);
        if (classif.elements) {
            for (var i = 0; i < classif.elements.length; i++) {
                doClassif(currentString, classif.elements[i]);
            }
        }
    }

    function flattenClassification(doc) {
        if (doc.classification) {
            for (var i = 0; i < doc.classification.length; i++) {
                if (doc.classification[i].elements) {
                    for (var j = 0; j < doc.classification[i].elements.length; j++) {
                        doClassif(doc.classification[i].stewardOrg.name, doc.classification[i].elements[j]);
                    }
                }
            }
        }
    }

    function findFormQuestionNr(fe) {
        var n = 0;
        if (fe.formElements) {
            for (var i = 0; i < fe.formElements.length; i++) {
                var e = fe.formElements[i];
                if (e.elementType && e.elementType === 'question') n++;
                else n = n + findFormQuestionNr(e);
            }
        }
        return n;
    }

    elt.numQuestions = findFormQuestionNr(elt);

    flattenClassification(elt);
    if (elt.valueDomain && elt.valueDomain.permissibleValues) {
        elt.valueDomain.nbOfPVs = elt.valueDomain.permissibleValues.length;
        if (elt.valueDomain.permissibleValues.length > 20) {
            elt.valueDomain.permissibleValues.length = 20;
        }
    }
    elt.flatClassifications = flatArray;
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.steward = elt.stewardOrg.name;
    elt.primaryNameCopy = elt.naming ? escapeHTML(elt.naming[0].designation) : '';
    if (elt.naming[0].definitionFormat === 'html') {
        elt.primaryDefinitionCopy = elt.naming[0].definition.replace(/<(?:.|\\n)*?>/gm, '');
    } else {
        elt.primaryDefinitionCopy = elt.naming ? escapeHTML(elt.naming[0].definition) : '';
    }
    var regStatusSortMap = {
        Retired: 6,
        Incomplete: 5,
        Candidate: 4,
        Recorded: 3,
        Qualified: 2,
        Standard: 1,
        "Preferred Standard": 0
    };
    elt.registrationState.registrationStatusSortOrder = regStatusSortMap[elt.registrationState.registrationStatus];
    if (elt.classification) {
        var size = elt.classification.length;
        if (size > 10) {
            elt.classificationBoost = 2.1;
        }
        else {
            elt.classificationBoost = 0.1 + 0.2 * size;
        }
    } else {
        elt.classificationBoost = 0.1;
    }
    elt.flatIds = [];
    if (elt.ids) {
        for (var i = 0; i < elt.ids.length; i++) {
            elt.flatIds.push(elt.ids[i].source + ' ' + elt.ids[i].id + ' ' + elt.ids[i].version);
        }
    }
    elt.flatProperties = [];
    if (elt.properties) {
        elt.properties.forEach(function (p) {
            elt.flatProperties.push(p.key + ' ' + p.value);
        });
    }
    if (elt.forkOf) {
        elt.isFork = true;
    }

    return elt;

};

exports.createBoardIndexJson = {
    "mappings": {
        "board": {
            "properties": {
                "labels": {"type": "string", "index": "not_analyzed"}
            }
        }
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
                , "search_suggest": {
                    "type": "completion",
                    "analyzer": "simple",
                    "search_analyzer": "simple",
                    "payloads": true
                }
            }
        }
    }
};

var shortHash = function (content) {
    return hash.createHash('md5')
        .update(JSON.stringify(content)).digest("hex")
        .substr(0, 5).toLowerCase();
};

if (config.elastic.index.name === "auto") {
    config.elastic.index.name = "cde_" + shortHash(exports.createIndexJson);
}
if (config.elastic.formIndex.name === "auto") {
    config.elastic.formIndex.name = "form_" + shortHash(exports.createFormIndexJson);
}
if (config.elastic.boardIndex.name === "auto") {
    config.elastic.boardIndex.name = "board_" + shortHash(exports.createBoardIndexJson);
}
if (config.elastic.storedQueryIndex.name === "auto") {
    config.elastic.storedQueryIndex.name = "sq_" + shortHash(exports.createStoredQueryIndexJson);
}

exports.indices = [
    {
        name: "cde",
        indexName: config.elastic.index.name,
        indexJson: exports.createIndexJson,
        filter: exports.riverFunction
    },
    {
        name: "form",
        indexName: config.elastic.formIndex.name,
        indexJson: exports.createFormIndexJson,
        filter: exports.riverFunction
    },
    {
        name: "board",
        indexName: config.elastic.boardIndex.name,
        indexJson: exports.createBoardIndexJson
    },
    {
        name: "storedQuery",
        indexName: config.elastic.storedQueryIndex.name,
        indexJson: exports.createStoredQueryIndexJson,
        filter: exports.storedQueryRiverFunction

    }
];

