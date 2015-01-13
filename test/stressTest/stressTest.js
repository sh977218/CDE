var mongoUri = "mongodb://localhost/test";
var serverUrl = "http://localhost:3001/";
var deViewQueryUri = "#/deview?cdeId=";
var listOfDeTinyIds = [];
var numberOfDataElementsToQuery = 1000;

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
    listOfDeTinyIds.slice(0, numberOfDataElementsToQuery).forEach(function(deId) {
        performRequest(deId, function(body) {
            console.log("DE Retrieved " + deId + " content: " + body.slice(0,20).replace(/\n/g,''));
        });
    });
};

var performRequest = function(tinyId, cb) {
    request(serverUrl + deViewQueryUri + tinyId, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(body);
        }
    })    
};