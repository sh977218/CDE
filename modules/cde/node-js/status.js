var config = require('config')
    , request = require('request')
    , mongo = require('./mongo-cde')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
;

var status = this;

status.restartAttempted = false; 

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

exports.assembleErrorMessage = function(statusReport) {
    if (!statusReport.elastic.up) return "ElasticSearch service is not responding. ES service might be not running.";
    if (!statusReport.elastic.results) return "ElasticSearch service is not returning any results. Index might be empty.";
    if (!statusReport.elastic.sync) return "ElasticSearch index is completely different from MongoDB. Data might be reingested but ES not updated.";
    if (!statusReport.elastic.updating) return "ElasticSearch service does not reflect modifications in MongoDB. River plugin might be out of order.";
};

exports.status = function(req, res) {    
    if (status.everythingOk()) {
        res.send("ALL SERVICES UP");        
    } else {
        var msg = status.assembleErrorMessage(status.statusReport);
        res.send("ERROR: " + msg);        
    }
};

status.delayReports = function() {
    status.reportSent = true;
    setTimeout(function() {
        status.reportSent = false;
    }, config.status.timeouts.emailSendPeriod);
};

exports.evaluateResult = function(statusReport) {
    if (process.uptime()<config.status.timeouts.minUptime) return;
    if (status.everythingOk()) return;
    if (status.reportSent) return;    
    if (!status.restartAttempted) status.tryRestart();    
    var msg = status.assembleErrorMessage(status.statusReport);
    email.send(msg, function(err) {
        if (!err) status.delayReports();
    });
};

status.tryRestart = function() {
    var exec = require('child_process').exec;
    exec(config.elastic.scripts.stop, function (error, stdout, stderr) {
        console.log("Elastic Search Stopped, STDOUT:" + stdout + "STDERR:" + stderr + "ERROR:" + error);
        exec(config.elastic.scripts.start, function (error, stdout, stderr) {
            console.log("Elastic Search Started, STDOUT:" + stdout + "STDERR:" + stderr + "ERROR:" + error);
            status.delayReports();
            status.restartAttempted = true;
        });    
    });    
};

status.checkElastic = function(elasticUrl, mongoCollection) {
    request.post(elasticUrl + "_search", {body: JSON.stringify({})}, function (error, response, bodyStr) {
        status.checkElasticUp(error, response, status.statusReport);
        var body = '';
        try {
            body = JSON.parse(bodyStr);  
            if (status.statusReport.elastic.up) status.checkElasticResults(body, status.statusReport);
            if (status.statusReport.elastic.results) status.checkElasticSync(body, status.statusReport, mongoCollection);
            if (status.statusReport.elastic.sync) status.checkElasticUpdating(body, status.statusReport, elasticUrl, mongoCollection);            
        } catch(e) {
            
        }
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
var created_i = 0;
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
    console.log("create ..." + created_i);
    var mc = mongoCollection;
    mc.create(fakeCde, {_id: null, username: ""}, function(err, mongoCde) {
        console.log("created!" + created_i++);
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
                        console.log(JSON.stringify(mc));
                        mc.DataElement.remove({"naming.designation":"NLM_APP_Status_Report_" + seed}).exec();
                    } catch(e) {
                        console.log("\n\n\n\n Cannot delete data element \n\n\n");
                        console.log(e.toString());
                    }
                }
            });            
        }, config.status.timeouts.dummyElementCheck);
    });
};

var launch_i = 0;
setInterval(function() {
    console.log("launch " + launch_i++);
    status.checkElastic(elastic.elasticCdeUri, mongo);
}, config.status.timeouts.statusCheck);    

