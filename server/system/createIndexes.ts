import { consoleLog } from '../../server/log/dbLogger';
import { config } from '../../server/system/parseConfig';

var elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});

export function deleteIndices() {
    esInit.indices.forEach(function (index) {
        consoleLog("deleting: " + index.indexName);
        esClient.indices.delete({index: index.indexName, timeout: "2s"}, function () {
        });
    });
}
