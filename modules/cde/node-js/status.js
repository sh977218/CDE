var config = require('../../system/node-js/parseConfig')
    , mongo_cde = require('./mongo-cde')
    , mongo_form = require('../../form/node-js/mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , elastic = require('../../system/node-js/elastic')
    , email = require('../../system/node-js/email')
    , async = require('async')
;

var app_status = this;

app_status.statusReport = {
    elastic: {
        up: false,
        indices: [
        ]
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

app_status.checkElasticCount = function(count, index, type, cb) {
    elastic.esClient.count(
        {
            index: index
            , type: type
        }
    , function(err, response) {
        if (err) {
            cb(false, "Error retrieving index count: " + err);
        } else {
            if (!(response.count >= count - 5 && response.count <= count + 5)) {
                cb(false, "Count mismatch because db count = " + count + " and esCount = " + response.count);
            } else {
                cb(true);
            }
        }
    });
};

app_status.isElasticUp = function(cb) {
    elastic.esClient.cat.health({h: "st"}, function(err, response) {
        if(err) {
            app_status.statusReport.elastic.up = "No Response on Health Check: " + err;
            cb(false);
        } else {
             if (response.indexOf("red") === 0) {
                 app_status.statusReport.elastic.up = false;
                 app_status.statusReport.elastic.message = "Cluster status is Red.";
                 cb();
             } else if (response.indexOf('yellow') === 0) {
                 app_status.statusReport.elastic.up = true;
                 app_status.statusReport.elastic.message = "Cluster status is Yellow.";
                 cb();
             } else if (response.indexOf("green") === 0) {
                 app_status.statusReport.elastic.up = true;
                 delete app_status.statusReport.elastic.message;
                 cb(true);
             } else {
                 app_status.statusReport.elastic.up = true;
                 app_status.statusReport.elastic.message = "Cluster status is unknown.";
                 cb(true);
             }
        }
    });
};

setInterval(function() {
    app_status.isElasticUp(function() {
        if (app_status.statusReport.elastic.up) {
            app_status.statusReport.elastic.indices = [];
            async.parallel([
               function(done) {
                   mongo_cde.deCount(function(deCount) {
                       app_status.checkElasticCount(deCount, config.elastic.index.name, "dataelement", function(up, message) {
                           app_status.statusReport.elastic.indices.push({
                               name: config.elastic.index.name,
                               up: up,
                               message: message
                           });
                           done();
                       });
                   });
               },
                function(done) {
                    mongo_form.count(function(count) {
                        app_status.checkElasticCount(count, config.elastic.formIndex.name, "form", function(up, message) {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.formIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                },
                function(done) {
                    mongo_cde.boardCount(function(count) {
                        app_status.checkElasticCount(count, config.elastic.boardIndex.name, "board", function(up, message) {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.boardIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                }
            ], function() {
                console.log(JSON.stringify(app_status.statusReport));
            });
        }
    });
//}, config.status.timeouts.statusCheck);
}, 5000);

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