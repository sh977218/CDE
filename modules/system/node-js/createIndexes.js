var config = require('./parseConfig')
    , elasticsearch = require('elasticsearch')
    , esInit = require('../../../deploy/elasticSearchInit')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

exports.recreateIndexes = function() {
    esInit.indices.forEach(function(i) {
        esClient.indices.delete({index: i.indexName}, function() {
        });
    });
};