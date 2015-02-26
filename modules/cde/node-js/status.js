var config = require('config')
    , request = require('request')
    , mongo = require('./mongo-cde')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
    , logging = require('../../system/node-js/logging.js')
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
        status.restartAttempted = false; 
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

exports.evaluateResult = function() {
    if (process.uptime()<config.status.timeouts.minUptime) return;
    if (status.everythingOk()) return;
    if (status.reportSent) return;    
    if (!status.restartAttempted) status.tryRestart();    
    var msg = status.assembleErrorMessage(status.statusReport);
    email.emailAdmins(msg, function(err) {
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
        status.evaluateResult();
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
    var fakeCde = {
        stewardOrg: {name: "FAKE"}
        , naming: [{
                designation: "NLM_APP_Status_Report"
                , definition: "NLM_APP_Status_Report"
        }]
        , registrationState: {registrationStatus: "Retired"}
    };

    mongoCollection.create(fakeCde, {_id: null, username: ""}, function(err, mongoCde) {
        setTimeout(function() {
            request.get(elasticUrl + "_search?q=" + mongoCde.tinyId, function (error, response, bodyStr) {
                if (error || response.statusCode !== 200) {
                    logging.errorLogger.error("Error in STATUS: Negative response from ElasticSearch", {origin: "cde.status.checkElasticUpdating", stack: new Error().stack, details: {bodyStr: bodyStr, error:error}}); 
                }
                var body = JSON.parse(bodyStr);
                if (body.hits.hits.length <= 0) {
                    statusReport.elastic.updating = false;    
                    logging.errorLogger.error("Error in STATUS: No data elements received from ElasticSearch", {origin: "cde.status.checkElasticUpdating", stack: new Error().stack, details: {bodyStr: bodyStr}}); 
                } else {
                    statusReport.elastic.updating = true; 
                    var elasticCde = body.hits.hits[0]._source;
                    if (mongoCde.tinyId !== elasticCde.tinyId) {
                        statusReport.elastic.updating = false;   
                        logging.errorLogger.error("Error in STATUS: CDE do not match", {origin: "cde.status.checkElasticUpdating",  stack: new Error().stack, details: {elasticCde: elasticCde, mongoCde: mongoCde}});
                    } else {
                        statusReport.elastic.updating = true;                        
                    }
                }
                mongoCollection.DataElement.remove({"tinyId": mongoCde.tinyId}).exec(function(err){
                    if (err) {
                        logging.errorLogger.error("Cannot delete dataelement", {origin: "cde.status.checkElasticUpdating",  stack: new Error().stack, details: {tinyId: mongoCde.tinyId, err: err}});                            
                    }                  
                });
            });            
        }, config.status.timeouts.dummyElementCheck);
    });
};

setInterval(function() {
    status.checkElastic(elastic.elasticCdeUri, mongo);
}, config.status.timeouts.statusCheck);    

