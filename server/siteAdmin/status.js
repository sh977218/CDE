const async = require('async');
const config = require('../system/parseConfig');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const boardDb = require('../board/boardDb');
const mongo_data = require('../system/mongo-data');
const elastic = require('../system/elastic');
const esInit = require('../system/elasticSearchInit');
const pushNotification = require('../system/pushNotification');
const dbLogger = require('../log/dbLogger');

exports.statusReport = {
    elastic: {
        up: false,
        indices: []
    }
};

exports.everythingOk = function () {
    return exports.statusReport.elastic.up;
};

exports.status = function (req, res) {
    if (exports.everythingOk()) {
        res.send('ALL SERVICES UP\n' + JSON.stringify(exports.statusReport));
    } else {
        res.send('ERROR: ' + JSON.stringify(exports.statusReport));
    }
};

exports.checkElasticCount = function (count, index, type, cb) {
    elastic.esClient.count({index: index, type: type}, (err, response) => {
            if (err) {
                cb(false, 'Error retrieving index count: ' + err);
            } else {
                if (!(response.count >= count - 5 && response.count <= count + 5)) {
                    cb(false, 'Count mismatch because db count = ' + count + ' and esCount = ' + response.count);
                } else {
                    cb(true);
                }
            }
        });
};

exports.isElasticUp = function (cb) {
    elastic.esClient.cat.health({h: 'st'}, (err, response) => {
        if (err) {
            exports.statusReport.elastic.up = 'No Response on Health Check: ' + err;
            cb(false);
        } else {
            if (response.indexOf('red') === 0) {
                exports.statusReport.elastic.up = false;
                exports.statusReport.elastic.message = 'Cluster status is Red.';
                cb();
            } else if (response.indexOf('yellow') === 0) {
                exports.statusReport.elastic.up = true;
                exports.statusReport.elastic.message = 'Cluster status is Yellow.';
                cb();
            } else if (response.indexOf('green') === 0) {
                exports.statusReport.elastic.up = true;
                delete exports.statusReport.elastic.message;
                cb(true);
            } else {
                exports.statusReport.elastic.up = true;
                exports.statusReport.elastic.message = 'Cluster status is unknown.';
                cb(true);
            }
        }
    });
};

exports.getStatus = getStatusDone => {
    exports.isElasticUp(() => {
        if (exports.statusReport.elastic.up) {
            let tempIndices = [];
            let condition = {archived: false};
            async.series([
                done => {
                    mongo_cde.count(condition, (err, deCount) => {
                        esInit.indices[0].totalCount = deCount;
                        exports.checkElasticCount(deCount, config.elastic.index.name, 'dataelement', (up, message) => {
                            tempIndices.push({
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
                        exports.checkElasticCount(formCount, config.elastic.formIndex.name, 'form', (up, message) => {
                            tempIndices.push({
                                name: config.elastic.formIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                },
                done => {
                    boardDb.count({}, function (err, boardCount) {
                        esInit.indices[2].totalCount = boardCount;
                        exports.checkElasticCount(boardCount, config.elastic.boardIndex.name, 'board', (up, message) => {
                            tempIndices.push({
                                name: config.elastic.boardIndex.name,
                                up: up,
                                message: message
                            });
                            done();
                        });
                    });
                }
            ], () => {
                exports.statusReport.elastic.indices = tempIndices;
                getStatusDone();
            });
        }
    });
};

let lastReport;
let notificationTimeout;

setInterval(() => {
    exports.getStatus(() => {
        let newReport = JSON.stringify(exports.statusReport);

        if (!!lastReport && newReport !== lastReport) {
            // different report
            if (!notificationTimeout) {
                // delay sending notif if report stays different for 1 minute
                notificationTimeout = setTimeout(() => {
                    // send notification now
                    lastReport = newReport;
                    let msg = JSON.stringify({
                        title: 'Elastic Search Index Issue',
                        options: {
                            body: 'Status reports not normal',
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
                    });
                    mongo_data.pushGetAdministratorRegistrations(registrations => {
                        registrations.forEach(r => pushNotification.triggerPushMsg(r, msg));
                    });

                    dbLogger.logError({
                        message: 'Elastic Search Status',
                        details: newReport
                    });
                }, config.status.timeouts.notificationTimeout);
            }
        } else {
            if (!!notificationTimeout) {
                // cancel sending notification because system is back to normal within a minute
                clearTimeout(notificationTimeout);
                notificationTimeout = undefined;
            }
        }
        if (!lastReport) {
            // set normal status for the first time.
            lastReport = newReport;
        }
    });
}, config.status.timeouts.statusCheck);

