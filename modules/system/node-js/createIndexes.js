var config = require('./parseConfig')
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.deleteIndices = function() {
    esInit.indices.forEach(function(i) {
        console.log("deleting: " + i.indexName);
        esClient.indices.delete({index: i.indexName, timeout: "2s"}, function() {
        });
    });
};