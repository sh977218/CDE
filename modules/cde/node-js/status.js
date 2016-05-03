var request = require('request')
    , config = require('../../system/node-js/parseConfig')
    , mongo = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
    //, logging = require('../../system/node-js/logging.js')
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
    return status.statusReport.elastic.up;
};

exports.assembleErrorMessage = function(statusReport) {
    if (!statusReport.elastic.up) return "ElasticSearch service is not responding. ES service might be not running.";
    if (!statusReport.elastic.results) return "ElasticSearch service is not returning any results. Index might be empty.";
    if (!statusReport.elastic.sync) return "ElasticSearch index is completely different from MongoDB. Data might be reingested but ES not updated.";
    //if (!statusReport.elastic.updating) return "ElasticSearch service does not reflect modifications in MongoDB. River plugin might be out of order.";
    return "";
};

exports.status = function(req, res) {    
    if (status.everythingOk()) {
        res.send("ALL SERVICES UP\n" + exports.assembleErrorMessage(status.statusReport));
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
            //if (status.statusReport.elastic.sync) status.checkElasticUpdating(body, status.statusReport, elasticUrl, mongoCollection);
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
    if (body.hits.hits.length>0) {
        statusReport.elastic.results = true;
    } else {
        statusReport.elastic.results = false;
        statusReport.elastic.sync = false;
        statusReport.elastic.updating = false;
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
                // +1 to allow elements that gets created for the check. 
                statusReport.elastic.sync = response.count  >= deCount - 5 && response.count <= deCount + 5 ;
                if (!statusReport.elastic.sync) {
                    console.log("Setting status sync to false because deCount = " + deCount + " and esCount = " + response.count);
                }
            }
        );
    });
};

setInterval(function() {
    status.checkElastic(config.elastic.hosts[0] + "/" + config.elastic.index.name + "/", mongo);
}, config.status.timeouts.statusCheck);

setInterval(function () {
    mongo_data_system.updateClusterHostStatus({
        hostname: config.hostname, port: config.port, nodeStatus: "Running",
        elastic: status.statusReport.elastic, pmPort: config.pm.port
    });
}, config.status.timeouts.clusterStatus * 1000);

mongo_data_system.updateClusterHostStatus({
    hostname: config.hostname, port: config.port, nodeStatus: "Running",
    elastic: status.statusReport.elastic, pmPort: config.pm.port,
    startupDate: new Date()
});