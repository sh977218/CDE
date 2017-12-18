const config = require('../../system/node-js/parseConfig');
const dbLogger = require('../../system/node-js/dbLogger.js');
const elasticsearch = require('elasticsearch');
const esInit = require('../../system/node-js/elasticSearchInit');
const elastic_system = require('../../system/node-js/elastic');

let esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.updateOrInsert = function(elt) {
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
                "ids" : {
                    "values" : idList
                }
            },
            "size": 20
        }
    }, function (error, response) {
        if (error) {
            logging.errorLogger.error("Error DataElementDistinct", {
                origin: "form.elastic.getByTinyIdList",
                stack: new Error().stack,
                details: "Error " + error + "response" + JSON.stringify(response)
            });
            cb(err);
        } else {
            cb(null, response.hits.hits.map(h=>h._source));
        }
    });
};
