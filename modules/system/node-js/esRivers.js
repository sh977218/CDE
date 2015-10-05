var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , CronJob = require('cron').CronJob
    , elasticsearch = require('elasticsearch')
    , dbLogger = require('./dbLogger.js')
;

console.log("es uri: " + config.elasticStoredQueryUri)

var storedQueryEsClient = new elasticsearch.Client({
    host: config.elastic.uri
});

var updateRunning = true;

storedQueryEsClient.deleteByQuery({
    index: config.elastic.storedQueryIndex.name,
    body: {"query" : {"match_all" : {}}}
}).then(function() {
    console.log("done removing");
    updateRunning = false;
});

var latestId;
var runRiver = function() {
    if (updateRunning) {
        console.log("update already running");
        return;
    }
    console.log("running river");
    var query = {};
    if (latestId) {
        query._id = {$gt: latestId}
    }
    console.log("query: " + JSON.stringify(query));
    var stream = dbLogger.StoredQueryModel.find(query).sort('_id').stream();
    stream.on('data', function(item) {
        console.log("item");
        latestId = item._id;
        storedQueryEsClient.create(
            {
                index: config.elastic.storedQueryIndex.name,
                type: "storedquery",
                id: latestId.toString(),
                body: item
            });
    });
    stream.on('close', function() {
        console.log("Done rivering storedQueries");
        updateRunning = false;
    });
};

var cj = new CronJob(
    '*/10 * * * * *',
    runRiver,
    true
);
cj.start();
