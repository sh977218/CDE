const async = require('async');

const config = require('./parseConfig');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_board = require('../board/mongo-board');
const mongo_data = require('./mongo-data');
const elastic = require('./elastic');
const esInit = require('./elasticSearchInit');
const pushNotification = require('./pushNotification');
const dbLogger = require('../log/dbLogger');

let app_status = this;

app_status.statusReport = {
    elastic: {
        up: false,
        indices: []
    }
};

exports.everythingOk = function () {
    return app_status.statusReport.elastic.up;
};

exports.status = function (req, res) {
    if (app_status.everythingOk()) {
        res.send("ALL SERVICES UP\n" + JSON.stringify(app_status.statusReport));
    } else {
        res.send("ERROR: " + JSON.stringify(app_status.statusReport));
    }
};

app_status.checkElasticCount = function (count, index, type, cb) {
    elastic.esClient.count({index: index, type: type}, (err, response) => {
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

app_status.isElasticUp = function (cb) {
    elastic.esClient.cat.health({h: "st"}, (err, response) => {
        if (err) {
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

app_status.getStatus = getStatusDone => {
    app_status.isElasticUp(() => {
        if (app_status.statusReport.elastic.up) {
            app_status.statusReport.elastic.indices = [];
            let condition = {archived: false};
            async.series([
                done => {
                    mongo_cde.count(condition, (err, deCount) => {
                        esInit.indices[0].totalCount = deCount;
                        app_status.checkElasticCount(deCount, config.elastic.index.name, "dataelement", (up, message) => {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.index.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                },
                done => {
                    mongo_form.count(condition, (err, formCount) => {
                        esInit.indices[1].totalCount = formCount;
                        app_status.checkElasticCount(formCount, config.elastic.formIndex.name, "form", (up, message) => {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.formIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                },
                done => {
                    mongo_board.count({}, function (err, boardCount) {
                        esInit.indices[2].totalCount = boardCount;
                        app_status.checkElasticCount(boardCount, config.elastic.boardIndex.name, "board", (up, message) => {
                            app_status.statusReport.elastic.indices.push({
                                name: config.elastic.boardIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                }
            ], getStatusDone);
        }
    });
};

let lastReport;
let notificationTimeout;

setInterval(() => {
    app_status.getStatus(() => {
        console.log("status got")
        let newReport = JSON.stringify(app_status.statusReport);

        if (!!lastReport && newReport !== lastReport) {
            console.log("different report")
            if (!notificationTimeout) {
                console.log("delay notif");
                notificationTimeout = setTimeout(() => {
                    console.log("sending notification");
                    let msg = {
                        title: 'Elastic Search Index Issue',
                        options: {
                            body: "Status reports not normal",
                            icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
                            badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
                            tag: 'cde-es-issue',
                            actions: [
                                {
                                    action: 'site-mgt-action',
                                    title: 'View',
                                    icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
                                }
                            ]
                        }
                    };

                    mongo_data.saveNotification({
                        title: 'Elastic Search Index Error',
                        url: "/status/cde",
                        roles: ['siteAdmin']
                    });

                    mongo_data.pushGetAdministratorRegistrations(registrations => {
                        registrations.forEach(r => pushNotification.triggerPushMsg(r, JSON.stringify(msg)));
                    });

                    dbLogger.logError({
                        message: "Elastic Search Status",
                        origin: "app_status.getStatus",
                        details: newReport
                    });
                    lastReport = newReport;
                }, config.status.timeouts.notificationTimeout);
            }
        } else {
            if (!!notificationTimeout) {
                console.log("cancel notification");
                clearTimeout(notificationTimeout);
                notificationTimeout = undefined;
            }
        }
        if (!lastReport) {
            console.log("update report");
            lastReport = newReport;
        }
    });
}, config.status.timeouts.statusCheck);

