const config = require('../system/parseConfig');
const dbLogger = require('../system/dbLogger.js');
const elasticsearch = require('elasticsearch');
const esInit = require('../system/elasticSearchInit');

let esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.updateOrInsert = function (elt) {
    esInit.riverFunction(elt.toObject(), function (doc) {
        if (doc) {
            delete doc._id;
            esClient.index({
                index: config.elastic.formIndex.name,
                type: "form",
                id: doc.tinyId,
                body: doc
            }, function (err) {
                if (err) {
                    dbLogger.logError({
                        message: "Unable to Re-Index document: " + doc.tinyId,
                        origin: "form.elastic.updateOrInsert",
                        stack: err,
                        details: ""
                    });
                }
            });
        }
    });
};

exports.byTinyIdList = function (idList, cb) {
    esClient.search({
        index: config.elastic.formIndex.name,
        type: "form",
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
            dbLogger.errorLogger.error("Error DataElementDistinct", {
                origin: "form.elastic.getByTinyIdList",
                stack: new Error().stack,
                details: "Error " + error + "response" + JSON.stringify(response)
            });
            cb(error);
        } else cb(null, response.hits.hits.map(h => h._source));
    });
};


exports.FormDistinct = function (field, cb) {
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
        type: "form",
        body: distinctQuery
    }, function (error, response) {
        if (error) {
            dbLogger.errorLogger.error("Error FormDistinct", {
                origin: "cde.elastic.FormDistinct",
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
