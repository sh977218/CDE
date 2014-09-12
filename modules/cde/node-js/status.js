var config = require('config')
    , request = require('request')
    , mongo = require('./mongo-cde')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
;

var status = this;

status.statusReport = {
    elastic: {
        up: false
        , results: false
        , sync: false
        , updating: false
    }
};    

exports.everythingOk = function() {
    return status.statusReport.elastic.up && status.statusReport.elastic.results && status.statusReport.elastic.sync && status.statusReport.elastic.updating;
};

exports.status = function(req, res) {    
    if (status.everythingOk()) {
        res.send("ALL SERVICES UP");        
    } else {
        res.send("ERROR: Please, restart elastic service. Details: " + JSON.stringify(status.statusReport));        
    }
};

exports.evaluateResult = function(statusReport) {
    if (process.uptime()<1) return;
    if (status.everythingOk()) return;
    var msg = 'ElasticSearch is misbehaving on production servers. Status: ' + JSON.stringify(status.statusReport);
    email.send(msg);
};


status.checkElastic = function(elasticUrl, mongoCollection) {
    request.post(elasticUrl + "_search", {body: JSON.stringify({})}, function (error, response, bodyStr) {
        status.checkElasticUp(error, response, status.statusReport);
        var body = JSON.parse(bodyStr);     
        if (status.statusReport.elastic.up) status.checkElasticResults(body, status.statusReport);
        if (status.statusReport.elastic.results) status.checkElasticSync(body, status.statusReport, mongoCollection);
        if (status.statusReport.elastic.sync) status.checkElasticUpdating(body, status.statusReport, elasticUrl, mongoCollection);
        status.evaluateResult(status.statusReport);
    });    
};

status.checkElasticUp = function(error, response, statusReport) {
    if (error || response.statusCode !== 200) { 
        statusReport.elastic.up = false; 
        statusReport.elastic.results = false; 
        statusReport.elastic.sync = false; 
        statusReport.elastic.updating = false; 
        return;
    } else {
        statusReport.elastic.up = true; 
    }    
};

status.checkElasticResults = function(body, statusReport) {
    if (!body.hits.hits.length>0) {
        statusReport.elastic.results = false; 
        statusReport.elastic.sync = false; 
        statusReport.elastic.updating = false;             
    } else {
        statusReport.elastic.results = true; 
    }    
};

status.checkElasticSync = function(body, statusReport, mongoCollection) {
    var elasticElt = body.hits.hits[0]._source;
    mongoCollection.byId(elasticElt._id, function(err, elt) {
        if (err) {
            statusReport.elastic.sync = false; 
            statusReport.elastic.updating = false;      
            return;
        }
        if (elasticElt.tinyId !== elt.tinyId) {
            statusReport.elastic.sync = false;      
            return;
        } else {
            statusReport.elastic.sync = true; 
        }
    });
};

status.checkElasticUpdating = function(body, statusReport, elasticUrl, mongoCollection) {
    var seed = Math.floor(Math.random()*100000);
    var fakeCde = {
        archived: true
        , stewardOrg: {name: ""}
        , naming: [{
                designation: "NLM_APP_Status_Report_" + seed
                , definition: "NLM_APP_Status_Report_" + seed
        }]
    };
    mongoCollection.create(fakeCde, {_id: null, username: ""}, function(err, mongoCde) {
        setTimeout(function() {
            request.get(elasticUrl + "_search?q=NLM_APP_Status_Report_"+seed, function (error, response, bodyStr) {
                var body = JSON.parse(bodyStr);
                if (body.hits.hits.length <= 0) {
                    statusReport.elastic.updating = false;      
                } else {
                    statusReport.elastic.updating = true; 
                    var elasticCde = body.hits.hits[0]._source;
                    if (mongoCde.tinyId !== elasticCde.tinyId) {
                        statusReport.elastic.updating = false;    
                    } else {
                        statusReport.elastic.updating = true;                        
                    }
                    try {
                        mongoCollection.DataElement.remove({"naming.designation":"NLM_APP_Status_Report_" + seed}).exec();
                    } catch(e) {
                        console.log("\n\n\n\n Cannot delete data element \n\n\n");
                        console.log(e.toString());
                    }
                }
            });            
        }, 30000);
    });
};

setInterval(function() {
    status.checkElastic(elastic.elasticCdeUri, mongo);
}, 60000);