var request = require('request')
    , config = require('../../system/node-js/parseConfig')
    , mongo = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
;

var app_status = this;

app_status.statusReport = {
    elastic: {
        up: "Not Checked"
        , results: "Not Checked"
        , sync: "Not Checked"
    }
};    

exports.everythingOk = function() {
    return app_status.statusReport.elastic.up;
};

exports.assembleErrorMessage = function(statusReport) {
    if (statusReport.elastic.up) return statusReport.elastic.up;
    else if (statusReport.elastic.results) return statusReport.elastic.results;
    else if (statusReport.elastic.sync) return statusReport.elastic.sync;
    else return "";
};

exports.status = function(req, res) {    
    if (app_status.everythingOk()) {
        res.send("ALL SERVICES UP\n" + exports.assembleErrorMessage(app_status.statusReport));
    } else {
        var msg = app_status.assembleErrorMessage(app_status.statusReport);
        res.send("ERROR: " + msg);
    }
};

app_status.delayReports = function() {
    app_status.reportSent = true;
    setTimeout(function() {
        app_status.reportSent = false;
    }, config.status.timeouts.emailSendPeriod);
};

exports.evaluateResult = function() {
    if (process.uptime() < config.status.timeouts.minUptime) return;
    if (app_status.statusReport.elastic.sync) return;
    if (app_status.reportSent) return;
    var emailContent = {
        subject: "Urgent: ElasticSearch issue on " + config.name
        , body: app_status.assembleErrorMessage(app_status.statusReport)
    };

    mongo_data_system.siteadmins(function(err, users) {
        email.emailUsers(emailContent, users, function(err) {
            if (!err) app_status.delayReports();
        });
    });
};

app_status.checkElastic = function(elasticUrl, mongoCollection) {
    request.post(elasticUrl + "_search", {body: JSON.stringify({})}, function (error, response, bodyStr) {
        app_status.checkElasticUp(error, response, app_status.statusReport);
        var body = '';
        try {
            body = JSON.parse(bodyStr);  
            if (app_status.statusReport.elastic.up) app_status.checkElasticResults(body, app_status.statusReport);
            if (app_status.statusReport.elastic.results) app_status.checkElasticSync(body, app_status.statusReport, mongoCollection);
        } catch(e) {
            
        }
        app_status.evaluateResult();
    });    
};

app_status.checkElasticUp = function(error, response, statusReport) {
    if (error || response.statusCode !== 200) { 
        statusReport.elastic.up = "Response: " + response.statusCode + " -- Error:  " + error;
        statusReport.elastic.results = "Not checked";
        statusReport.elastic.sync = "Not Checked";
    } else {
        delete statusReport.elastic.up;
    }    
};

app_status.checkElasticResults = function(body, statusReport) {
    if (body.hits.hits.length > 0) {
        delete statusReport.elastic.results;
    } else {
        statusReport.elastic.results = "No results in Query. BODY: " + body;
        statusReport.elastic.sync = "Not Checked";
    }
};

app_status.checkElasticSync = function(body, statusReport) {
    mongo.deCount(function(deCount) {
        elastic.esClient.count(
            {
                index: config.elastic.index.name
                , type: "dataelement"
            }
        , function(error, response) {
                // +1 to allow elements that gets created for the check. 
                if (!(response.count  >= deCount - 5 && response.count <= deCount + 5)) {
                    statusReport.elastic.sync =  "Setting status sync to false because deCount = " + deCount +
                        " and esCount = " + response.count;
                } else {
                    delete statusReport.elastic.sync;
                }
            }
        );
    });
};

setInterval(function() {
    app_status.checkElastic(config.elastic.hosts[0] + "/" + config.elastic.index.name + "/", mongo);
}, config.status.timeouts.statusCheck);

setInterval(function () {
    mongo_data_system.updateClusterHostStatus({
        hostname: config.hostname, port: config.port, nodeStatus: "Running",
        elastic: app_status.statusReport.elastic, pmPort: config.pm.port
    });
}, config.status.timeouts.clusterStatus * 1000);

mongo_data_system.updateClusterHostStatus({
    hostname: config.hostname, port: config.port, nodeStatus: "Running",
    elastic: app_status.statusReport.elastic, pmPort: config.pm.port,
    startupDate: new Date()
});