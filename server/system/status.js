var config = require('./parseConfig')
    , mongo_cde = require('../cde/mongo-cde')
    , mongo_form = require('../form/mongo-form')
    , mongo_board = require('../board/mongo-board')
    , mongo_storedQuery = require('../cde/mongo-storedQuery')
    , mongo_data_system = require('./mongo-data')
    , elastic = require('./elastic')
    , esInit = require('./elasticSearchInit')
    , email = require('./email')
    , async = require('async')
    , moment = require('moment')
;

var app_status = this;

app_status.statusReport = {
    elastic: {
        up: false,
        indices: []
    }
};    

exports.everythingOk = function() {
    return app_status.statusReport.elastic.up;
};

exports.status = function(req, res) {    
    if (app_status.everythingOk()) {
        res.send("ALL SERVICES UP\n" + JSON.stringify(app_status.statusReport));
    } else {
        res.send("ERROR: " + JSON.stringify(app_status.statusReport));
    }
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

var startupDate = new Date();
app_status.getStatus = function(done) {
    app_status.isElasticUp(function() {
        if (app_status.statusReport.elastic.up) {
            app_status.statusReport.elastic.indices = [];
            var condition = {archived: false};
            async.series([
                function(done) {
                    mongo_cde.count(condition, function (err, deCount) {
                        esInit.indices[0].totalCount = deCount;
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
                    mongo_form.count(condition, function (err, formCount) {
                        esInit.indices[1].totalCount = formCount;
                        app_status.checkElasticCount(formCount, config.elastic.formIndex.name, "form", function (up, message) {
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
                    mongo_board.count({}, function (err, boardCount) {
                        esInit.indices[2].totalCount = boardCount;
                        app_status.checkElasticCount(boardCount, config.elastic.boardIndex.name, "board", function (up, message) {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.boardIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                },
                function (done) {
                    mongo_storedQuery.count({}, function (err, storedQueryCount) {
                        esInit.indices[3].totalCount = storedQueryCount;
                        app_status.checkElasticCount(storedQueryCount, config.elastic.storedQueryIndex.name, "storedquery", function (up, message) {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.storedQueryIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                }
            ], function() {
                mongo_data_system.updateClusterHostStatus({
                    hostname: config.hostname, port: config.port, nodeStatus: "Running",
                    elastic: app_status.statusReport.elastic, pmPort: config.pm.port, startupDate: startupDate
                });
                if (done) done();
            });
        }
    });
};

var currentActiveNodes;
var lastReport;
setInterval(function() {
    app_status.getStatus(function() {
        var newReport = JSON.stringify(app_status.statusReport);
        if (!!lastReport && newReport !== lastReport) {
            var emailContent = {
                subject: "ElasticSearch Status Change " + config.name
                , body: newReport
            };
            mongo_data_system.siteadmins(function(err, users) {
                email.emailUsers(emailContent, users, function() {});
            });
        }
        lastReport = newReport;

        var timeDiff = config.status.timeouts.statusCheck / 1000 + 30;
        mongo_data_system.getClusterHostStatuses(function (err, statuses) {
            var now = moment();
            var activeNodes = statuses.filter( function (s) {
                return now.diff(moment(s.lastUpdate), 'seconds') < timeDiff;
            }).map( s => s.hostname + ":" + s.port).sort();
            if (!currentActiveNodes) currentActiveNodes = activeNodes;
            else {
                if (!(currentActiveNodes.length === activeNodes.length && currentActiveNodes.every ((v,i)=> v === activeNodes[i]))) {
                    var emailContent = {
                        subject: "Server Configuration Change"
                        , body: "Server Configuration Change from " + currentActiveNodes + " to " + activeNodes
                    };
                    mongo_data_system.siteadmins(function(err, users) {
                        email.emailUsers(emailContent, users, function() {});
                    });
                }
                currentActiveNodes = activeNodes;
            }
        });
    });
}, config.status.timeouts.statusCheck);
