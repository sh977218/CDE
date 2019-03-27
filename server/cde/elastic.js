const config = require('../system/parseConfig');
const sharedElastic = require('../system/elastic.js');
const dbLogger = require('../log/dbLogger.js');
const logging = require('../system/logging.js');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

const esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.esClient = esClient;

exports.updateOrInsert = function (elt, cb) {
    esInit.riverFunction(elt.toObject(), doc => {
        if (doc) {
            delete doc._id;
            esClient.index({
                index: config.elastic.index.name,
                type: "dataelement",
                id: doc.tinyId,
                body: doc
            }, err => {
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
            esInit.suggestRiverFunction(elt, sugDoc => {
                esClient.index({
                    index: config.elastic.cdeSuggestIndex.name,
                    type: "suggest",
                    id: doc.tinyId,
                    body: sugDoc
                })
            });
        }
    });
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
        Object.keys(query.highlight.fields).forEach(field => {
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

    if (!settings.fullRecord) {
        query._source = {excludes: ["flatProperties", "properties", "classification.elements", "formElements"]};
    }

    sharedElastic.elasticsearch('cde', query, settings, (err, result) => {
        if (result && result.cdes && result.cdes.length > 0) {
            dbLogger.storeQuery(settings);
        }
        cb(err, result);
    });
};

const mltConf = {
    "mlt_fields": [
        "designations.designation",
        "definitions.definition",
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
                        "like": [
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

exports.get = function (id, cb) {
    esClient.get({
        index: config.elastic.index.name,
        type: "dataelement",
        id: id
    }, cb);
};


exports.byTinyIdList = function (idList, size, cb) {
    idList = idList.filter(id => !!id);
    esClient.search({
        index: config.elastic.index.name,
        type: "dataelement",
        body: {
            "query": {
                "ids": {
                    "values": idList
                }
            },
            "size": size
        }
    }, (error, response) => {
        if (error) {
            logging.errorLogger.error("Error getByTinyIdList", {
                origin: "cde.elastic.byTinyIdList",
                stack: new Error().stack,
                details: "Error " + error + "response" + JSON.stringify(response)
            });
            cb(error);
        } else {
            // @TODO possible to move this sort to elastic search?
            response.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
            cb(null, response.hits.hits.map(h => h._source));
        }
    });
};