var request = require('request')
    , config = require('../../system/node-js/parseConfig')
    , mongo = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
    , logging = require('../../system/node-js/logging.js')
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
    return status.statusReport.elastic.up
        && status.statusReport.elastic.results
        && status.statusReport.elastic.sync;
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

exports.evaluateResult = function() {
    if (process.uptime() < config.status.timeouts.minUptime) return;
    if (status.statusReport.elastic.updating) return;
    if (status.reportSent) return;    
    var emailContent = {
        subject: "Urgent: ElasticSearch issue on " + config.name
        , body: status.assembleErrorMessage(status.statusReport)
    };

    mongo_data_system.siteadmins(function(err, users) {
        email.emailUsers(emailContent, users, function(err) {
            if (!err) status.delayReports();
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

status.checkElasticSync = function(body, statusReport) {
    mongo.deCount(function(deCount) {
        elastic.esClient.count(
            {
                index: config.elastic.index.name
                , type: "dataelement"
            }
        , function(error, response) {
                statusReport.elastic.sync = response.count >= deCount;
                if (!statusReport.elastic.sync) {
                    console.log("Setting status sync to false because deCount = " + deCount +
                    "and esCount = " + response.count);
                }
            }
        )
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
                var errorToLog = {
                    origin: "cde.status.checkElasticUpdating"
                    , stack: new Error().stack
                    , details: {}
                };
                if (error || response.statusCode !== 200) {
                    errorToLog.details = {bodyStr: bodyStr, error: error, nodeName: config.name};
                    logging.errorLogger.error("Error in STATUS: Negative response from ElasticSearch", errorToLog); 
                }
                var body = JSON.parse(bodyStr);
                if (body.hits.hits.length <= 0) {
                    statusReport.elastic.updating = false;    
                    errorToLog.details = {bodyStr: bodyStr, nodeName: config.name};
                    logging.errorLogger.error("Error in STATUS: No data elements received from ElasticSearch", errorToLog); 
                } else {
                    statusReport.elastic.updating = true; 
                    var elasticCde = body.hits.hits[0]._source;
                    if (mongoCde.tinyId !== elasticCde.tinyId) {
                        statusReport.elastic.updating = false;   
                        errorToLog.details = {elasticCde: elasticCde, mongoCde: mongoCde, nodeName: config.name};
                        logging.errorLogger.error("Error in STATUS: CDE do not match", errorToLog);
                    } else {
                        statusReport.elastic.updating = true;                        
                    }
                }
                mongoCollection.DataElement.remove({"tinyId": mongoCde.tinyId}).exec(function(err){
                    if (err) {
                        errorToLog.details = {tinyId: mongoCde.tinyId, err: err, nodeName: config.name};
                        logging.errorLogger.error("Cannot delete dataelement", errorToLog);                            
                    }                  
                });
            });            
        }, config.status.timeouts.dummyElementCheck);
    });
};

setInterval(function() {
    status.checkElastic(config.elastic.hosts[0] + "/" + config.elastic.index.name + "/", mongo);
}, config.status.timeouts.statusCheck);

setInterval(function() {
    var server = {hostname: config.hostname, port: config.port, nodeStatus: "Running",
        elastic:status.statusReport.elastic, pmPort: config.pm.port};
    mongo_data_system.updateClusterHostStatus(server);
}, config.status.timeouts.clusterStatus * 1000);

