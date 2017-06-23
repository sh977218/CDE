var config = require('./parseConfig')
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    , dbLogger = require('./dbLogger')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.deleteIndices = function() {
    esInit.indices.forEach(function (index) {
        dbLogger.consoleLog("deleting: " + index.indexName);
        esClient.indices.delete({index: index.indexName, timeout: "2s"}, function () {
        });
    });
};