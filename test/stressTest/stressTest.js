var mongoUri = "mongodb://localhost/test";
var serverUrl = "http://localhost:3001/";
var deViewQueryUri = "#/deview?cdeId=";
var listOfDeTinyIds = [];
var numberOfDataElementsToQuery = 100;
var testPeriod = 5000;

var request = require('request')
    , mongoose = require('mongoose');

mongoose.connect(mongoUri);

var deSimpleSchema = mongoose.Schema({
    tinyId: String
});

var simpleDataElement = mongoose.model('dataelements', deSimpleSchema);

simpleDataElement.find({},"tinyId",function (err, dataelements) {
    listOfDeTinyIds = dataelements.map(function(de){return de.tinyId;});
    console.log("Data Elements received.");
    runTest();
});

var runTest = function() {
    setInterval(function() {
        runQueries();
    },testPeriod);
};

var runQueries = function() {
    listOfDeTinyIds.sort(function() {return .5 - Math.random();}).slice(0, numberOfDataElementsToQuery).forEach(function(deId) {
        performRequest(deId, function(durationMs, body) {
            console.log("DE Retrieved"
                + ", duration: " + durationMs
                + ", tinyId: " + deId 
                + " content: " + body.slice(0,20).replace(/\n/g,'')
            );
        });
    });
};

var performRequest = function(tinyId, cb) {
    var startTime = new Date().getTime();
    request(serverUrl + deViewQueryUri + tinyId, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var endTime = new Date().getTime();
            var durationMs = endTime - startTime;
            cb(durationMs, body);
        }
    })    
};