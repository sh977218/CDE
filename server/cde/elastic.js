var config = require('../system/parseConfig')
    , sharedElastic = require('../system/elastic.js')
    , dbLogger = require('../system/dbLogger.js')
    , logging = require('../system/logging.js')
    , elasticsearch = require('elasticsearch')
    , esInit = require('../system/elasticSearchInit')
;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.esClient = esClient;

exports.updateOrInsert = function (elt, cb) {
    esInit.riverFunction(elt.toObject(), function (doc) {
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
                if (cb) cb(err);
            });
        }
    });
};

exports.boardRefresh = function (cb) {
    esClient.indices.refresh({index: config.elastic.boardIndex.name}, cb);
};

exports.storedQueryUpdateOrInsert = function (elt) {
    esInit.storedQueryRiverFunction(elt.toObject(), function (doc) {
        if (doc) {
            delete doc._id;
            esClient.index({
                index: config.elastic.storedQueryIndex.name,
                type: "storedquery",
                id: elt._id.toString(),
                body: doc
            }, function (err) {
                if (err) {
                    dbLogger.logError({
                        message: "Unable to Index document: " + doc.tinyId,
                        origin: "storedQuery.elastic.updateOrInsert",
                        stack: err,
                        details: ""
                    });
                }
            });
        }
    });
};

exports.storedQueryDelete = function (elt) {
    if (elt) {
        esClient.delete({
            index: config.elastic.storedQueryIndex.name,
            type: "storedquery",
            id: elt._id.toString()
        }, function (err) {
            if (err) {
                dbLogger.logError({
                    message: "Unable to delete storedQuery: " + elt._id.toString(),
                    origin: "cde.elastic.storeQueryDelete",
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
                    message: "Unable to index board: " + elt._id.toString(),
                    origin: "cde.elastic.boardUpdateOrInsert",
                    stack: err,
                    details: ""
                });
            }
        });
    }
};

exports.boardDelete = function (elt) {
    if (elt) {
        esClient.delete({
            index: config.elastic.boardIndex.name,
            type: "board",
            id: elt._id.toString()
        }, function (err) {
            if (err) {
                dbLogger.logError({
                    message: "Unable to delete board: " + elt._id.toString(),
                    origin: "cde.elastic.boardDelete",
                    stack: err,
                    details: ""
                });
            }
        });
    }
};

exports.dataElementDelete = function (elt, cb) {
    if (elt) {
        esClient.delete({
            index: config.elastic.index.name,
            type: "dataelement",
            id: elt.tinyId
        }, function (err) {
            if (err) {
                dbLogger.logError({
                    message: "Unable to delete dataelement: " + elt.tinyId,
                    origin: "cde.elastic.dataElementDelete",
                    stack: err,
                    details: ""
                });
            }
            cb(err);
        });
    } else cb();
};

exports.elasticsearch = function (user, settings, cb) {
    const query = sharedElastic.buildElasticSearchQuery(user, settings);
    if (query.size > 100) return cb("size exceeded");
    if ((query.from + query.size) > 10000) return cb("page size exceeded");
    if (!config.modules.cde.highlight) {
        Object.keys(query.highlight.fields).forEach(function (field) {
            if (!(field === "primaryNameCopy" || field === "primaryDefinitionCopy")) {
                delete query.highlight.fields[field];
            }
        });
    }
    if (settings.includeAggregations)
        query.aggregations.datatype = {
            "filter": settings.filterDatatype,
            "aggs": {
                "datatype": {
                    "terms": {
                        "field": "valueDomain.datatype",
                        "size": 500,
                        "order": {
                            "_term": "desc"
                        }
                    }
                }
            }
        };

    if (!settings.fullRecord)
        query._source = {excludes: ["flatProperties", "properties", "classification.elements", "formElements"]};

    sharedElastic.elasticsearch('cde', query, settings, function (err, result) {
        if (result && result.cdes && result.cdes.length > 0) {
            dbLogger.storeQuery(settings);
        }
        cb(err, result);
    });
};

const mltConf = {
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
            "bool": {
                "must": {
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
                        must_not: [
                            {
                                term: {
                                    "registrationState.registrationStatus": "Retired"
                                }
                            },
                            {
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
        "size": 0,
        "aggs": {
            "aggregationsName": {
                "terms": {
                    "field": field,
                    "size": 1000
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
                details: "query " + JSON.stringify(distinctQuery) + "error " + error + "response" + JSON.stringify(response)
            });
        } else {
            let list = response.aggregations.aggregationsName.buckets.map(function (b) {
                return b.key;
            });
            cb(list);
        }
    });
};

exports.boardSearch = function (filter, cb) {
    let query = {
        "size": 100,
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {"shareStatus": 'Public'}
                    }
                ]
            }
        },
        "aggs": {
            "tagAgg": {
                "terms": {
                    "field": "tags",
                    "size": 50
                }
            },
            "typeAgg": {
                "terms": {
                    "field": "type"
                }
            }
        }
    };

    if (filter.search && filter.search.length > 0) {
        query.query.bool.must.push({
            "match": {"_all": filter.search}
        });
    }

    if (filter.selectedTypes) {
        filter.selectedTypes.forEach(function (t) {
            if (t !== 'All') {
                query.query.bool.must.push(
                    {
                        "term": {
                            "type": {
                                value: t
                            }
                        }
                    });
            }
        });
    }
    if (filter.selectedTags) {
        filter.selectedTags.forEach(function (t) {
            if (t !== 'All') {
                query.query.bool.must.push(
                    {
                        "term": {
                            "tags": {
                                value: t
                            }
                        }
                    });
            }
        });
    }
    esClient.search({
        index: config.elastic.boardIndex.name,
        type: "board",
        body: query
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error BoardDistinct", {
                origin: "cde.elastic.boardSearch",
                stack: new Error().stack,
                details: "query " + JSON.stringify(query) + "error " + error + "response" + JSON.stringify(response)
            });
            cb("Unable to query");
        } else {
            delete response._shards;
            cb(null, response);
        }
    });
};

exports.myBoards = function (user, filter, cb) {
    if (!user) return cb("no user provided");
    if (!filter) {
        filter = {
            sortDirection: '',
            selectedTags: ['All'],
            selectedTypes: ['All'],
            selectedShareStatus: ['All']
        };
    }
    var query = {
        "size": 100,
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "owner.username": {
                                value: user.username.toLowerCase()
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "typeAgg": {
                "terms": {
                    "field": "type"
                }
            },
            "tagAgg": {
                "terms": {
                    "field": "tags",
                    "size": 50
                }
            },
            "ssAgg": {
                "terms": {
                    "field": "shareStatus"
                }
            }
        },
        "sort": []
    };
    var sort = {};
    if (filter.sortBy) {
        sort[filter.sortBy] = {};
        if (filter && filter.sortDirection)
            sort[filter.sortBy].order = filter.sortDirection;
        else
            sort[filter.sortBy].order = "asc";
    }
    else {
        sort['updatedDate'] = {"order": "asc"};
        query.sort.push(sort);
    }
    if (filter.boardName) {
        query.query.bool.must.push({
            "query_string": {
                "fields": ["name"]
                , "query": filter.booardName
            }
        });
    }
    query.sort.push(sort);
    if (filter.selectedTypes) {
        filter.selectedTypes.forEach(function (t) {
            if (t !== 'All') {
                query.query.bool.must.push(
                    {
                        "term": {
                            "type": {
                                value: t
                            }
                        }
                    });
            }
        });
    }
    if (filter.selectedTags) {
        filter.selectedTags.forEach(function (t) {
            if (t !== 'All') {
                query.query.bool.must.push(
                    {
                        "term": {
                            "tags": {
                                value: t
                            }
                        }
                    });
            }
        });
    }
    if (filter.selectedShareStatus) {
        filter.selectedShareStatus.forEach(function (ss) {
            if (ss !== 'All') {
                query.query.bool.must.push(
                    {
                        "term": {
                            "shareStatus": {
                                value: ss
                            }
                        }
                    });
            }
        });
    }
    esClient.search({
        index: config.elastic.boardIndex.name,
        type: "board",
        body: query
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error BoardDistinct", {
                origin: "cde.elastic.myBoards",
                stack: new Error().stack,
                details: "query " + JSON.stringify(query) + "error " + error + "response" + JSON.stringify(response)
            });
            cb("Unable to query");
        } else {
            delete response._shards;
            cb(null, response);
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

exports.get = function (id, cb) {
    esClient.get({
        index: config.elastic.index.name,
        type: "dataelement",
        id: id
    }, cb);
};


exports.byTinyIdList = function (idList, cb) {
    esClient.search({
        index: config.elastic.index.name,
        type: "dataelement",
        body: {
            "query": {
                "ids": {
                    "values": idList
                }
            },
            "size": 20
        }
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error getByTinyIdList", {
                origin: "cde.elastic.byTinyIdList",
                stack: new Error().stack,
                details: "Error " + error + "response" + JSON.stringify(response)
            });
            cb(error);
        } else {
            cb(null, response.hits.hits.map(h => h._source));
        }
    });
};