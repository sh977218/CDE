var config = require('../../system/node-js/parseConfig')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , dbLogger = require('../../system/node-js/dbLogger.js')
    , logging = require('../../system/node-js/logging.js')
    , elasticsearch = require('elasticsearch')
    , esInit = require('../../system/node-js/elasticSearchInit')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.updateOrInsert = function (elt) {
    var doc = esInit.riverFunction(elt.toObject());
    if (doc) {
        delete doc._id;
        esClient.index({
            index: config.elastic.index.name,
            type: "dataelement",
            id: doc.tinyId,
            body: doc
        }, function (err) {
            if (err) {
                dbLogger.logError({
                    message: "Unable to Index document: " + doc.tinyId,
                    origin: "cde.elastic.updateOrInsert",
                    stack: err,
                    details: ""
                });
            }
        });
    }
};

exports.boardUpdateOrInsert = function (elt) {
    if (elt) {
        var doc = elt.toObject();
        delete doc._id;
        esClient.index({
            index: config.elastic.boardIndex.name,
            type: "board",
            id: elt._id.toString(),
            body: doc
        }, function (err) {
            if (err) {
                dbLogger.logError({
                    message: "Unable to index board: " + doc.tinyId,
                    origin: "cde.elastic.boardUpdateOrInsert",
                    stack: err,
                    details: ""
                });
            }
        });
    }
};

exports.elasticsearch = function (user, settings, cb) {
    var query = sharedElastic.buildElasticSearchQuery(user, settings);
    if (!config.modules.cde.highlight) {
        Object.keys(query.highlight.fields).forEach(function (field) {
            if (!(field === "primaryNameCopy" || field === "primaryDefinitionCopy")) {
                delete query.highlight.fields[field];
            }
        });
    }
    sharedElastic.elasticsearch(query, 'cde', function (err, result) {
        if (result && result.cdes && result.cdes.length > 0) {
            dbLogger.storeQuery(settings);
        }
        cb(err, result);
    });
};

var mltConf = {
    "mlt_fields": [
        "naming.designation",
        "naming.definition",
        "valueDomain.permissibleValues.permissibleValue",
        "valueDomain.permissibleValues.valueMeaningName",
        "valueDomain.permissibleValues.valueMeaningCode",
        "property.concepts.name"
    ]
};

exports.morelike = function (id, callback) {
    var from = 0;
    var limit = 20;
    var mltPost = {
        "query": {
            "filtered": {
                "query": {
                    "more_like_this": {
                        "fields": mltConf.mlt_fields,
                        "docs": [
                            {
                                "_id": id
                            }
                        ],
                        "min_term_freq": 1,
                        "min_doc_freq": 1,
                        "min_word_length": 2
                    }
                },
                "filter": {
                    bool: {
                        must_not: [{
                            term: {
                                "registrationState.registrationStatus": "Retired"
                            }
                        }
                            , {
                                term: {
                                    "isFork": "true"
                                }
                            }
                        ]
                    }
                }
            }
        }
    };

    esClient.search({
        index: config.elastic.index.name,
        type: "dataelement",
        body: mltPost
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error: More Like This",
                {
                    origin: "cde.elastic.morelike",
                    stack: new Error().stack,
                    details: "Error: " + error + ", response: " + JSON.stringify(response)
                });
            callback("Error");
        } else {
            var result = {
                cdes: []
                , pages: Math.ceil(response.hits.total / limit)
                , page: Math.ceil(from / limit)
                , totalNumber: response.hits.total
            };
            for (var i = 0; i < response.hits.hits.length; i++) {
                var thisCde = response.hits.hits[i]._source;
                if (thisCde.valueDomain.permissibleValues.length > 10) {
                    thisCde.valueDomain.permissibleValues = thisCde.valueDomain.permissibleValues.slice(0, 10);
                }
                result.cdes.push(thisCde);
            }
            callback(result);
        }
    });
};

exports.DataElementDistinct = function (field, cb) {
    var distinctQuery = {
        "size": 0
        , "aggs": {
            "aggregationsName": {
                "terms": {
                    "field": field
                    , "size": 1000
                }
            }
        }
    };
    esClient.search({
        index: config.elastic.index.name,
        type: "dataelement",
        body: distinctQuery
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error DataElementDistinct", {
                origin: "cde.elastic.DataElementDistinct",
                stack: new Error().stack,
                details: "query " + JSON.stringify(distinctQuery) + "error " + error + "respone" + JSON.stringify(response)
            });
        } else {
            var list = response.aggregations.aggregationsName.buckets.map(function (b) {
                return b.key;
            });
            cb(list);
        }
    });
};

exports.myBoardTags = function (user, cb) {
    if (!user) return cb("no user provided");
    var distinctQuery = {
        "size": 0,
        "query": {
            "bool": {
                "must": {
                    "term": {
                        "owner.username": {
                            value: user.username
                        }
                    }
                }
            }
        },
        "aggs": {
            "aggregationsName": {
                "terms": {
                    "field": "tags",
                    "size": 1000
                }
            }
        }
    };
    esClient.search({
        index: config.elastic.boardIndex.name,
        type: "board",
        body: distinctQuery
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error BoardDistinct", {
                origin: "cde.elastic.BoardDistinct",
                stack: new Error().stack,
                details: "query " + JSON.stringify(distinctQuery) + "error " + error + "respone" + JSON.stringify(response)
            });
        } else {
            var list = response.aggregations.aggregationsName.buckets.map(function (b) {
                return b.key;
            });
            cb(list);
        }
    });
};

exports.myTaggedBoards = function (user, tagValue, cb) {
    if (!user) return cb("no user provided");
    var query = {
        "size": 0,
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "owner.username": {
                                value: user.username
                            }
                        }
                    },
                    {
                        "match": {
                            "tags": tagValue
                        }
                    }
                ]
            }
        }
    };
    esClient.search({
        index: config.elastic.boardIndex.name,
        type: "board",
        body: query
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error BoardDistinct", {
                origin: "cde.elastic.myTaggedBoards",
                stack: new Error().stack,
                details: "query " + JSON.stringify(query) + "error " + error + "respone" + JSON.stringify(response)
            });
        } else {
            var list = response.aggregations.aggregationsName.buckets.map(function (b) {
                return b.key;
            });
            cb(list);
        }
    });
};

exports.pVCodeSystemList = [];

exports.fetchPVCodeSystemList = function () {
    var elastic = this;
    this.DataElementDistinct("valueDomain.permissibleValues.codeSystemName", function (result) {
        elastic.pVCodeSystemList = result;
    });
};