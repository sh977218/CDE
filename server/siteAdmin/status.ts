import * as async from 'async';
import { config } from '../system/parseConfig';
import { DataElement } from 'server/cde/mongo-cde';
const mongoCde = require('../cde/mongo-cde');
const mongoForm = require('../form/mongo-form');
const boardDb = require('../board/boardDb');
const mongoData = require('../system/mongo-data');
const elastic = require('../system/elastic');
const esInit = require('../system/elasticSearchInit');
const pushNotification = require('../system/pushNotification');
const dbLogger = require('../log/dbLogger');

export const statusReport: any = {
    elastic: {
        up: false,
        indices: []
    }
};

export function everythingOk() {
    return statusReport.elastic.up;
}

export function status(req, res) {
    if (everythingOk()) {
        res.send('ALL SERVICES UP\n' + JSON.stringify(statusReport));
    } else {
        res.send('ERROR: ' + JSON.stringify(statusReport));
    }
}

export function checkElasticCount(count, index, type, cb) {
    elastic.esClient.count({index, type}, (err, response) => {
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
}

export function isElasticUp(cb) {
    elastic.esClient.cat.health({h: 'st'}, (err, response) => {
        if (err) {
            statusReport.elastic.up = 'No Response on Health Check: ' + err;
            cb(false);
        } else {
            if (response.indexOf('red') === 0) {
                statusReport.elastic.up = false;
                statusReport.elastic.message = 'Cluster status is Red.';
                cb();
            } else if (response.indexOf('yellow') === 0) {
                statusReport.elastic.up = true;
                statusReport.elastic.message = 'Cluster status is Yellow.';
                cb();
            } else if (response.indexOf('green') === 0) {
                statusReport.elastic.up = true;
                delete statusReport.elastic.message;
                cb(true);
            } else {
                statusReport.elastic.up = true;
                statusReport.elastic.message = 'Cluster status is unknown.';
                cb(true);
            }
        }
    });
}

export function getStatus(getStatusDone) {
    isElasticUp(() => {
        if (statusReport.elastic.up) {
            const tempIndices = [];
            const condition = {archived: false};
            async.series([
                done => {
                    DataElement.countDocuments(condition, (err, deCount) => {
                        esInit.indices[0].totalCount = deCount;
                        checkElasticCount(deCount, config.elastic.index.name, 'dataelement', (up, message) => {
                            tempIndices.push({
                                name: config.elastic.index.name,
                                up,
                                message
                            });
                            done();
                        });
                    });
                },
                done => {
                    mongoForm.count(condition, (err, formCount) => {
                        esInit.indices[1].totalCount = formCount;
                        checkElasticCount(formCount, config.elastic.formIndex.name, 'form', (up, message) => {
                            tempIndices.push({
                                name: config.elastic.formIndex.name,
                                up,
                                message
                            });
                            done();
                        });
                    });
                },
                done => {
                    boardDb.count({}, (err, boardCount) => {
                        esInit.indices[2].totalCount = boardCount;
                        checkElasticCount(boardCount, config.elastic.boardIndex.name, 'board', (up, message) => {
                            tempIndices.push({
                                name: config.elastic.boardIndex.name,
                                up,
                                message
                            });
                            done();
                        });
                    });
                }
            ], () => {
                statusReport.elastic.indices = tempIndices;
                getStatusDone();
            });
        }
    });
}

let lastReport;
let notificationTimeout;

setInterval(() => {
    getStatus(() => {
        const newReport = JSON.stringify(statusReport);

        if (!!lastReport && newReport !== lastReport) {
            // different report
            if (!notificationTimeout) {
                // delay sending notif if report stays different for 1 minute
                notificationTimeout = setTimeout(() => {
                    // send notification now
                    lastReport = newReport;
                    const msg = JSON.stringify({
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
                    mongoData.pushGetAdministratorRegistrations(registrations => {
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
