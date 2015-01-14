var mongoUri = "mongodb://localhost/test";
var serverUrl = "http://localhost:3001/";
var deViewQueryUri = "#/deview?cdeId=";
var listOfDeTinyIds = [];
var numberOfUsers = 100;
var testPeriod = 30000;
var waitFromHomeToList = 2000;
var waitFromListToDetail = 2000;

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
        console.log("\n\n-----------------------------\nQuery Load: ");
        releaseUsers();
    },testPeriod);
};

var releaseUsers = function() {
    for (var user=0; user<numberOfUsers; user++ ) {
        var delayedStart = Math.random() * testPeriod;
        setTimeout(function() {
            viewHomePage(user);
        }, delayedStart);
        setTimeout(function() {
            viewListPage(user);
        }, delayedStart + waitFromHomeToList);
        setTimeout(function() {
            viewDetailPage(user);
        }, delayedStart + waitFromHomeToList + waitFromListToDetail);        
    };
};

var viewHomePage = function(user) {console.log("user #"+user+"viewing homepage");};
var viewListPage = function(user) {console.log("user #"+user+"viewing list page");};
var viewDetailPage = function(user) {console.log("user #"+user+"viewing detail page");};

//var runQueries = function() {
//    listOfDeTinyIds.sort(function() {return .5 - Math.random();}).slice(0, numberOfDataElementsToQuery).forEach(function(deId) {
//        performRequest(serverUrl + deViewQueryUri + deId.tinyId, function(durationMs, body) {
//            console.log("DE Retrieved"
//                + ", duration: " + durationMs
//                + ", tinyId: " + deId 
//                + " content: " + body.slice(0,20).replace(/\n/g,'')
//            );
//        });
//    });
//};

var performRequest = function(uri, cb) {
    var startTime = new Date().getTime();
    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var endTime = new Date().getTime();
            var durationMs = endTime - startTime;
            cb(durationMs, body);
        }
    })    
};

//"{""query"":{""size"":20,""query"":{""bool"":{""must_not"":[{""term"":{""registrationState.registrationStatus"":""Retired""}},{""term"":{""registrationState.administrativeStatus"":""retire""}},{""term"":{""archived"":""true""}},{""term"":{""isFork"":""true""}}],""must"":[{""dis_max"":{""queries"":[{""function_score"":{""script_score"":{""script"":""(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value""}}}]}}]}},""aggregations"":{""lowRegStatusOrCurator_filter"":{""filter"":{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]},""aggs"":{""orgs"":{""terms"":{""field"":""classification.stewardOrg.name"",""size"":40,""order"":{""_term"":""desc""}}}}},""statuses"":{""terms"":{""field"":""registrationState.registrationStatus""},""aggregations"":{""lowRegStatusOrCurator_filter"":{""filter"":{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]}}}}},""filter"":{""and"":[{""or"":[{""term"":{""registrationState.registrationStatus"":""Preferred Standard""}},{""term"":{""registrationState.registrationStatus"":""Standard""}},{""term"":{""registrationState.registrationStatus"":""Qualified""}}]},{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]}]},""from"":null,""highlight"":{""order"":""score"",""fields"":{""*"":{""pre_tags"":[""<strong>""],""post_tags"":[""</strong>""],""content"":{""fragment_size"":1000}}}}}}"