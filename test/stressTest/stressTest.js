var mongoUri = "mongodb://localhost/test";
var serverUrl = "http://localhost:3001/";
var deViewQueryUri = "#/deview?cdeId=";
var listOfDeTinyIds = [];
var numberOfUsers = 10;
var testPeriod = 30000;
var waitFromHomeToList = 2000;
var waitFromListToDetail = 2000;

var request = require('request');

var queriesViewHomepage = [
    {uri: '#/deview?cdeId=', etag: null}
    , {uri: 'cde/public/assets/css/bootstrap.min.css', etag: null}
    , {uri: 'cde/public/assets/css/font-awesome.min.css', etag: null}
    , {uri: 'cde/public/assets/css/ng-grid.min.css', etag: null}
    , {uri: 'cde/public/assets/css/select2.css', etag: null}
    , {uri: 'cde/public/assets/css/selectize.default.css', etag: null}
    , {uri: 'cde/public/css/style.css', etag: null}
    , {uri: 'cde/public/assets/css/textAngular.css', etag: null}
    , {uri: 'cde/public/assets/js/jquery.min.js', etag: null}
    , {uri: 'cde/public/assets/js/jquery-ui.min.js', etag: null}
    , {uri: 'cde/public/assets/js/angular.min.js', etag: null}
    , {uri: 'cde/public/assets/js/angular-route.min.js', etag: null}
    , {uri: 'cde/public/assets/js/angular-resource.min.js', etag: null}
    , {uri: 'cde/public/assets/js/angular-sanitize.min.js', etag: null}
    , {uri: 'cde/public/assets/js/angular-animate.min.js', etag: null}
    , {uri: 'cde/public/assets/js/jquery-1.11.1.min.js', etag: null}
    , {uri: 'cde/public/assets/js/ng-grid-2.0.7.min.js', etag: null}
    , {uri: 'cde/public/assets/js/textAngular-rangy.min.js', etag: null}
    , {uri: 'cde/public/assets/js/textAngular-sanitize.min.js', etag: null}
    
    , {uri: 'systemAlert', etag: null}
    , {uri: 'user/me', etag: null}
    , {uri: 'listOrgsDetailedInfo', etag: null}
    , {uri: 'template/system/list', etag: null}
    //, {uri: 'elasticSearch/cde', etag: null}
    , {uri: 'template/cde/cdeAccordionList', etag: null}
];

/*mongoose.connect(mongoUri);

var deSimpleSchema = mongoose.Schema({
    tinyId: String
});

var simpleDataElement = mongoose.model('dataelements', deSimpleSchema);

simpleDataElement.find({},"tinyId",function (err, dataelements) {
    listOfDeTinyIds = dataelements.map(function(de){return de.tinyId;});
    console.log("Data Elements received.");
    runTest();
});*/

var runTest = function() {
    var _runTest = function() {
        console.log("\n\n-----------------------------\nQuery Load: ");
        releaseUsers();
    };
    _runTest();
    setInterval(_runTest, testPeriod);
};

var releaseUsers = function() {
    for (var user=0; user<numberOfUsers; user++ ) {
        var delayedStart = Math.random() * testPeriod;
        setTimeout(function() {
            viewHomePage();
        }, delayedStart);
        setTimeout(function() {
            viewListPage();
        }, delayedStart + waitFromHomeToList);
        setTimeout(function() {
            viewDetailPage();
        }, delayedStart + waitFromHomeToList + waitFromListToDetail);        
    };
};

var performRequest = function(location, cb) {
    var startTime = new Date().getTime();
    var options = {
        url: serverUrl + location.uri
        , headers: {            
        }
    };    
    if (location.etag) options.headers['If-None-Match'] = location.etag;
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var endTime = new Date().getTime();
            var durationMs = endTime - startTime;
            if (response.headers.etag) location.etag = response.headers.etag;
            cb(durationMs, body);
        }
    })    
};

var viewHomePage = function() {
    console.log("user viewing homepage");
    queriesViewHomepage.forEach(function(location) {
        performRequest(location, function(durationMs, body) {
            console.log("Opened Page"
                + ", duration: " + durationMs
                + " content: " + body.slice(0,20).replace(/\n/g,'')
            );
        });
    });
};

var viewListPage = function() {
    console.log("user viewing list page");
};
var viewDetailPage = function() {
    console.log("user viewing detail page");
};

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

//var performRequest = function(uri, cb) {
//    var startTime = new Date().getTime();
//    request(uri, function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            var endTime = new Date().getTime();
//            var durationMs = endTime - startTime;
//            cb(durationMs, body);
//        }
//    })    
//};

runTest();


//"{""query"":{""size"":20,""query"":{""bool"":{""must_not"":[{""term"":{""registrationState.registrationStatus"":""Retired""}},{""term"":{""registrationState.administrativeStatus"":""retire""}},{""term"":{""archived"":""true""}},{""term"":{""isFork"":""true""}}],""must"":[{""dis_max"":{""queries"":[{""function_score"":{""script_score"":{""script"":""(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value""}}}]}}]}},""aggregations"":{""lowRegStatusOrCurator_filter"":{""filter"":{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]},""aggs"":{""orgs"":{""terms"":{""field"":""classification.stewardOrg.name"",""size"":40,""order"":{""_term"":""desc""}}}}},""statuses"":{""terms"":{""field"":""registrationState.registrationStatus""},""aggregations"":{""lowRegStatusOrCurator_filter"":{""filter"":{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]}}}}},""filter"":{""and"":[{""or"":[{""term"":{""registrationState.registrationStatus"":""Preferred Standard""}},{""term"":{""registrationState.registrationStatus"":""Standard""}},{""term"":{""registrationState.registrationStatus"":""Qualified""}}]},{""or"":[{""range"":{""registrationState.registrationStatusSortOrder"":{""lte"":3}}}]}]},""from"":null,""highlight"":{""order"":""score"",""fields"":{""*"":{""pre_tags"":[""<strong>""],""post_tags"":[""</strong>""],""content"":{""fragment_size"":1000}}}}}}"