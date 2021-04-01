var serverUrl =  "http://localhost:3001/";
var deViewQueryUri = "/deView?cdeId=";
var listOfDeTinyIds = [];
var numberOfUsers = 350 ;
var percentNewUsers = 10;
var testPeriod = 10000;
var waitFromHomeToList = 2000;
var waitFromListToDetail = 2000;
var responseLengthToCompare = 300;
var nrOfCdesInDb = 10000;

var fetch = require('node-fetch');
require('log-buffer');

var queriesViewHomepage = [
    {uri: '/deView?cdeId=', etag: null}
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
    , {uri: 'template/cde/cdeAccordionList', etag: null}
];

var queriesListPage = [
    {uri: 'template/cde/cdeAccordionList', etag: null}
    , {uri: 'template/cde/cdeAccordionList', etag: null}
    , {uri: 'cde/public/assets/fonts/glyphicons-halflings-regular.woff', etag: null}
];

var queriesDetailPage = [
    {uri: 'dataelement/', etag: null, isApi: true}
    , {uri: 'moreLikeCde/', etag: null, isApi: true}
    //, {uri: 'deBoards/tYAa6S8P7wC', etag: null}
    , {uri: 'permissibleValueCodeSystemList', etag: null}
    , {uri: 'priorcdes/', etag: null, isApi: true}
    , {uri: 'forks/', etag: null, isApi: true}
    , {uri: 'systemAlert', etag: null}
];

var curentCde = null;

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
    }
};

var performRequest = function(location, cb) {
    var startTime = new Date().getTime();
    var url = serverUrl + location.uri;
    var options = {
        headers: {
        }
    };    
    if (location.isApi && curentCde) options.url += curentCde._id;
    var isNewUser = Math.random()*100 < percentNewUsers;
    if (location.etag && !isNewUser) options.headers['If-None-Match'] = location.etag;
    fetch(url, options)
        .then(res => {
            if (res.status !== 200) {
                throw res.status + ' ' + res.statusText;
            }
            if (res.headers.get('etag')) {
                location.etag = res.headers.get('etag');
            }
            return res.text();
        })
        .then(body => {
            var endTime = new Date().getTime();
            var durationMs = endTime - startTime;

            if (location.response) {
                if (location.response.substr(0, responseLengthToCompare) !== body.substr(0, responseLengthToCompare)) {
                    throw new Error('Response from server does not match previous!')
                }
            } else {
                location.response = body.substr(0, responseLengthToCompare);
            }
            cb(durationMs, body, location.uri.substr(-30, 30));
        });
};

var printQueryOutput = function(durationMs, body, uri) {
    console.log("Opened Page"
        + ", duration: " + durationMs
        + " page: " + uri
        + " content: " + body.slice(0,20).replace(/\n/g,'')
    );
};

var viewHomePage = function() {
    console.log("user viewing homepage");
    queriesViewHomepage.forEach(function(location) {
        performRequest(location, printQueryOutput);
    });
};

var queryElastic = function(elasticQuery, cb) {
    var startTime = new Date().getTime();
    fetch(serverUrl + 'elasticSearch/cde', {method: 'POST', body: JSON.stringify(elasticQuery)})
        .then(res => {
            if (res.status !== 200) {
                throw res.status + ' ' + res.statusText;
            }
            return res.json();
        })
        .then(function (body) {
            var endTime = new Date().getTime();
            var durationMs = endTime - startTime;
            try {
                curentCde = body.cdes[0];
            } catch(err){
                console.log(err);
            }
            cb(durationMs, body, 'elasticSearch/cde');
        });
};

var viewListPage = function() {    
    console.log("user viewing list page");
    queriesListPage.forEach(function(location) {
        performRequest(location, printQueryOutput);
    });   
    
    
    var term = Math.random().toString(36).substring(7);
    var from = Math.random()*nrOfCdesInDb;
    var emptyQuery = {"query":{"size":20,"query":{"bool":{"must_not":[{"term":{"registrationState.registrationStatus":"Retired"}},{"term":{"registrationState.administrativeStatus":"retire"}},{"term":{"archived":"true"}},{"term":{"isFork":"true"}}],"must":[{"dis_max":{"queries":[{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"}}}]}}]}},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]},"aggs":{"orgs":{"terms":{"field":"classification.stewardOrg.name","size":40,"order":{"_term":"desc"}}}}},"statuses":{"terms":{"field":"registrationState.registrationStatus"},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}}}}},"filter":{"and":[{"or":[{"term":{"registrationState.registrationStatus":"Preferred Standard"}},{"term":{"registrationState.registrationStatus":"Standard"}},{"term":{"registrationState.registrationStatus":"Qualified"}}]},{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}]}
        ,"from":from
            ,"highlight":{"order":"score","fields":{"*":{"pre_tags":["<strong>"],"post_tags":["</strong>"],"content":{"fragment_size":1000}}}}}};
    var termQuery = {"query":{"size":20,"query":{"bool":{"must_not":[{"term":{"registrationState.registrationStatus":"Retired"}},{"term":{"registrationState.administrativeStatus":"retire"}},{"term":{"archived":"true"}},{"term":{"isFork":"true"}}],"must":[{"dis_max":{"queries":[{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{
        "query_string":{"query":term}
            }}},{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{"query_string":{"fields":["naming.designation^5","naming.definition^2"],
        "query":term
            }},"boost":"2"}},{"function_score":{"script_score":{"script":"(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"},"query":{"query_string":{"fields":["naming.designation^5","naming.definition^2"],
        "query":"\""+term+"\"~4"
            }}}}]}}]}},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]},"aggs":{"orgs":{"terms":{"field":"classification.stewardOrg.name","size":40,"order":{"_term":"desc"}}}}},"statuses":{"terms":{"field":"registrationState.registrationStatus"},"aggregations":{"lowRegStatusOrCurator_filter":{"filter":{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}}}}},"filter":{"and":[{"or":[{"term":{"registrationState.registrationStatus":"Preferred Standard"}},{"term":{"registrationState.registrationStatus":"Standard"}},{"term":{"registrationState.registrationStatus":"Qualified"}},{"term":{"registrationState.registrationStatus":"Recorded"}}]},{"or":[{"range":{"registrationState.registrationStatusSortOrder":{"lte":3}}}]}]},"from":null,"highlight":{"order":"score","fields":{"*":{"pre_tags":["<strong>"],"post_tags":["</strong>"],"content":{"fragment_size":1000}}}}}};    
    queryElastic(emptyQuery, printQueryOutput);
    queryElastic(termQuery, printQueryOutput);
};

var viewDetailPage = function() {
    console.log("user viewing detail page");
    queriesDetailPage.forEach(function(location) {
        performRequest(location, printQueryOutput);
    });      
};

runTest();
