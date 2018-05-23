const config = require('config');
const hash = require("crypto");

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
                , "flatMeshTrees": {"type": "string", "index": "not_analyzed"}
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
                        "datatype": {"type": "string", "index": "not_analyzed"},
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
                        "source": {"type": "string", "index": "not_analyzed"},
                        "id": {"type": "string"},
                        "version": {"type": "string"}
                    }
                }
                , "tinyId": {"type": "string", "index": "not_analyzed"}
                , "updated": {"type": "date", "index": "no"}
                , "updatedBy": {properties: {"username": {"type": "string"}}}
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
                        "tags": {"type": "string", "index": "not_analyzed"}
                    }
                }
                , "version": {"type": "string", "index": "no"}
                , "views": {type: "integer"}
                , primaryNameSuggest: {
                    "type": "string",
                    "analyzer": "autocomplete",
                    "search_analyzer": "standard"
                }
            }
        }
    }, settings: {
        index: {
            "number_of_replicas": config.elastic.number_of_replicas,
            analysis: {
                "filter": {
                    "autocomplete_filter": {
                        "type": "edge_ngram",
                        "min_gram": 1,
                        "max_gram": 20
                    }
                },
                analyzer: {
                    default: {
                        type: 'snowball'
                        , language: 'English'
                    },
                    "autocomplete": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "autocomplete_filter"
                        ]
                    }
                }
            }
        }
    }
};


//noinspection JSAnnotator
exports.createFormIndexJson = {
    "mappings": {
        "form": {
            "properties": {
                "stewardOrg": {properties: {"name": {"type": "string", "index": "not_analyzed"}}}
                , "flatClassifications": {"type": "string", "index": "not_analyzed"}
                , "flatMeshTrees": {"type": "string", "index": "not_analyzed"}
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
                        "source": {"type": "string", "index": "not_analyzed"},
                        "id": {"type": "string"},
                        "version": {"type": "string"}
                    }
                }, "views": {"type": "integer"}
                , "numQuestions": {"type": "integer"}
                , primaryNameSuggest: {
                    "type": "string",
                    "analyzer": "autocomplete",
                    "search_analyzer": "standard"
                }
            }
        }
    }, settings: {
        index: {
            "number_of_replicas": config.elastic.number_of_replicas,
            analysis: {
                "filter": {
                    "autocomplete_filter": {
                        "type": "edge_ngram",
                        "min_gram": 1,
                        "max_gram": 20
                    }
                },
                analyzer: {
                    default: {
                        type: 'snowball'
                        , language: 'English'
                    },
                    "autocomplete": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "autocomplete_filter"
                        ]
                    }
                }
            }
        }
    }
};

exports.riverFunction = function (_elt, cb) {
    if (_elt.archived) return cb();

    function hasInForm(e) {
        if (!e.formElements) {
            return false;
        } else {
            if (e.formElements.find(fe => fe.elementType === 'form')) {
                return true;
            } else {
                for (var i = 0; i < e.formElements.length; i++) {
                    if (hasInForm(e.formElements[i])) return true;
                }
            }
        }
    }

    var formCtrl = require('../form/formCtrl');

    var getElt = hasInForm(_elt) ? formCtrl.fetchWholeForm : function (e, cb) {
        cb(e);
    };

    getElt(_elt, function (elt) {

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
        elt.primaryNameCopy = elt.designations[0] ? escapeHTML(elt.designations[0].designation) : '';
        elt.primaryNameSuggest = elt.primaryNameCopy;
        elt.primaryDefinitionCopy = elt.definitions[0] ? elt.definitions[0].definition : '';
        if (elt.definitions[0] && elt.definitions[0].definitionFormat === 'html')
            elt.primaryDefinitionCopy = elt.primaryDefinitionCopy.replace(/<(?:.|\\n)*?>/gm, '');
        else elt.primaryDefinitionCopy = escapeHTML(elt.primaryDefinitionCopy);

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
        elt.flatIds = elt.ids.map(function (id) {
            return id.source + ' ' + id.id + ' ' + id.version;
        });
        elt.flatProperties = elt.properties.map(function (p) {
            return p.key + ' ' + p.value;
        });
        if (elt.forkOf) {
            elt.isFork = true;
        }

        return cb(elt);
    });

};

exports.createBoardIndexJson = {
    "mappings": {
        "board": {
            "properties": {
                "type": {"type": "string", "index": "not_analyzed"},
                "tags": {"type": "string", "index": "not_analyzed"},
                "shareStatus": {"type": "string", "index": "not_analyzed"}
            }
        }
    }, settings: {
        index: {
            "number_of_replicas": config.elastic.number_of_replicas
        }
    }
};

var shortHash = function (content) {
    return hash.createHash('md5')
        .update(JSON.stringify(content)).digest("hex")
        .substr(0, 5).toLowerCase();
};

if (config.elastic.index.name === "auto") {
    config.elastic.index.name = "cde_v3_" + shortHash(exports.createIndexJson);
}
if (config.elastic.formIndex.name === "auto") {
    config.elastic.formIndex.name = "form_v3_" + shortHash(exports.createFormIndexJson);
}
if (config.elastic.boardIndex.name === "auto") {
    config.elastic.boardIndex.name = "board_" + shortHash(exports.createBoardIndexJson);
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
    }
];

