const config = require('config');
const hash = require('crypto');
const boardElasticSearchMapping = require('../board/elasticSearchMapping');

let primaryNameSuggest = {
    "type": "text",
    "analyzer": "autocomplete",
    "search_analyzer": "standard"
};

exports.createSuggestIndexJson = {
    "mappings": {
        "suggest": {
            "properties": {
                "nameSuggest": primaryNameSuggest,
                "stewardOrg": {
                    "properties": {
                        "name": {"type": "keyword"}
                    }
                },
                "registrationState": {
                    properties: {
                        "registrationStatus": {"type": "keyword"}
                    }
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

exports.createIndexJson = {
    "mappings": {
        "dataelement": {
            "date_detection": false,
            "properties": {
                "primaryNameCopy": {
                    "type": "text",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "index": false
                        }
                    }
                },
                "stewardOrg": {
                    "properties": {
                        "name": {"type": "keyword"}
                    }
                }
                , "flatClassifications": {"type": "keyword"}
                , "flatMeshTrees": {"type": "keyword"}
                , "classification": {
                    properties: {
                        "stewardOrg": {
                            properties: {
                                "name": {"type": "keyword"}
                            }
                        }
                    }
                }
                , "classificationSize": {type: "integer"}
                , "registrationState": {
                    properties: {
                        "registrationStatus": {"type": "keyword"}
                    }
                }
                , "source": {"type": "keyword"}
                , "origin": {"type": "keyword"}
                , "valueDomain": {
                    properties: {
                        "datatype": {"type": "keyword"},
                        "permissibleValues": {
                            properties: {
                                "codeSystemName": {"type": "keyword"}
                            }
                        }
                    }
                }
                , "properties": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "key": {"type": "text"},
                        "value": {"type": "text"}
                    }
                }, "ids": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "source": {"type": "keyword"},
                        "id": {"type": "text"},
                        "version": {"type": "text"}
                    }
                }
                , "tinyId": {"type": "keyword"}
                , "created": {"type": "date"}
                , "updated": {"type": "date"}
                , "imported": {"type": "date"}
                , "updatedBy": {properties: {"username": {"type": "text"}}}
                , "changeNote": {"enabled": false}
                , "attachments": {
                    properties: {
                        "fileid": {"enabled": false},
                        "filename": {"enabled": false}
                    }
                }
                , "history": {"enabled": false}
                , "version": {"type": "keyword"}
                , "views": {type: "integer"}
            }
        }
    }, settings: {
        index: {
            "number_of_replicas": config.elastic.number_of_replicas
        },
        analysis: {
            analyzer: {
                default: {
                    type: 'snowball'
                    , language: 'English'
                }
            }
        }
    }
};


//noinspection JSAnnotator
exports.createFormIndexJson = {
    "mappings": {
        "form": {
            "date_detection": false,
            "properties": {
                "primaryNameCopy": {
                    "type": "text",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "index": false
                        }
                    }
                },
                "stewardOrg": {properties: {"name": {"type": "keyword"}}}
                , "flatClassifications": {"type": "keyword"}
                , "flatMeshTrees": {"type": "keyword"}
                , "classification": {
                    properties: {
                        "stewardOrg": {
                            "properties": {
                                "name": {"type": "keyword"}
                            }
                        }
                    }
                }
                , "classificationSize": {type: "integer"}
                , "registrationState": {
                    properties: {
                        "registrationStatus": {"type": "keyword"}
                    }
                }
                , "source": {"type": "keyword"}
                , "origin": {"type": "keyword"}
                , "properties": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "key": {"type": "text"},
                        "value": {"type": "text"}
                    }
                }, "ids": {
                    "type": "nested",
                    "include_in_parent": true,
                    "properties": {
                        "source": {"type": "keyword"},
                        "id": {"type": "text"},
                        "version": {"type": "text"}
                    }
                }, "views": {"type": "integer"},
                "created": {"type": "date"},
                "updated": {"type": "date"},
                "imported": {"type": "date"},
                "numQuestions": {"type": "integer"}
            }
        }
    }, settings: {
        "index.mapping.total_fields.limit": 2000,
        index: {
            "number_of_replicas": config.elastic.number_of_replicas
        },
        analysis: {
            analyzer: {
                default: {
                    type: 'snowball'
                    , language: 'English'
                }
            }
        }

    }
};


exports.suggestRiverFunction = function (_elt, cb) {
    let toIndex = {nameSuggest: _elt.designations[0].designation};
    toIndex.registrationState = _elt.registrationState;
    toIndex.stewardOrg = _elt.stewardOrg;
    toIndex.tinyId = _elt.tinyId;

    return cb(toIndex);
};


exports.riverFunction = function (_elt, cb) {
    if (_elt.archived) return cb();

    const formSvc = require('../form/formsvc');

    let getElt = _elt.formElements ? formSvc.fetchWholeForm : function (e, cb) {
        cb(undefined, e);
    };

    getElt(_elt, function (err, elt) {
        function escapeHTML(s) {
            if (!s) return '';
            return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        let flatArray = [];

        function doClassif(currentString, classif) {
            if (currentString.length > 0) {
                currentString = currentString + ';';
            }
            currentString = currentString + classif.name;
            flatArray.push(currentString);
            if (classif.elements) classif.elements.forEach(e => doClassif(currentString, e));
        }

        function flattenClassification(doc) {
            if (doc.classification) {
                doc.classification.forEach(dc => {
                    if (dc.elements) {
                        dc.elements.forEach(dce => doClassif(dc.stewardOrg.name, dce));
                    }
                });
            }
        }

        function findFormQuestionNr(fe) {
            let n = 0;
            if (fe.formElements) {
                fe.formElements.forEach(fee => {
                    if (fee.elementType === 'question') n++;
                    else n = n + findFormQuestionNr(fee);
                });
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
        elt.classificationSize = elt.classification.length;

        elt.primaryDefinitionCopy = elt.definitions[0] ? elt.definitions[0].definition : '';
        if (elt.definitions[0] && elt.definitions[0].definitionFormat === 'html') {
            elt.primaryDefinitionCopy = elt.primaryDefinitionCopy.replace(/<(?:.|\\n)*?>/gm, '');
        } else {
            elt.primaryDefinitionCopy = escapeHTML(elt.primaryDefinitionCopy);
        }

        let regStatusSortMap = {
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
            let size = elt.classification.length;
            if (size > 10) {
                elt.classificationBoost = 2.1;
            } else {
                elt.classificationBoost = 0.1 + 0.2 * size;
            }
        } else {
            elt.classificationBoost = 0.1;
        }
        elt.flatIds = elt.ids.map(id => id.source + ' ' + id.id + ' ' + id.version);
        elt.flatProperties = elt.properties.map(p => p.key + ' ' + p.value);

        return cb(elt);
    });
};

let shortHash = function (content) {
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
    config.elastic.boardIndex.name = "board_" + shortHash(boardElasticSearchMapping.createIndexJson);
}
if (config.elastic.cdeSuggestIndex.name === "auto") {
    config.elastic.cdeSuggestIndex.name = "cdesuggest_" + shortHash(exports.createSuggestIndexJson);
}
if (config.elastic.formSuggestIndex.name === "auto") {
    config.elastic.formSuggestIndex.name = "formsuggest_" + shortHash(exports.createSuggestIndexJson);
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
        indexJson: boardElasticSearchMapping.createIndexJson
    },
    {
        name: "cdeSuggest",
        indexName: config.elastic.cdeSuggestIndex.name,
        indexJson: exports.createSuggestIndexJson,
        filter: exports.suggestRiverFunction
    },
    {
        name: "formSuggest",
        indexName: config.elastic.formSuggestIndex.name,
        indexJson: exports.createSuggestIndexJson,
        filter: exports.suggestRiverFunction
    }
];

