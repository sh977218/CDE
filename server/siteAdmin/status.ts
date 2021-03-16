import { series } from 'async';
import { find } from 'lodash';
import { Request, Response } from 'express';
import { count as boardCount } from 'server/board/boardDb';
import { dataElementModel } from 'server/cde/mongo-cde';
import { count } from 'server/form/mongo-form';
import { logError } from 'server/log/dbLogger';
import { triggerPushMsg } from 'server/notification/pushNotificationSvc';
import { pushGetAdministratorRegistrations } from 'server/notification/notificationDb';
import { esClient } from 'server/system/elastic';
import { indices } from 'server/system/elasticSearchInit';
import { config } from 'server/system/parseConfig';
import { Cb, Cb1, ElasticQueryResponse, ItemElastic } from 'shared/models.model';

interface IndexStatus {
    name: string;
    up: boolean | string;
    message?: string;
}

export const statusReport: { elastic: { up: boolean | string, indices: IndexStatus[], message?: string } } = {
    elastic: {
        up: false,
        indices: []
    }
};

export function everythingOk() {
    return statusReport.elastic.up;
}

export function status(req: Request, res: Response) {
    if (everythingOk()) {
        res.send('ALL SERVICES UP\n' + JSON.stringify(statusReport));
    } else {
        res.send('ERROR: ' + JSON.stringify(statusReport));
    }
}

export function checkElasticCount(count: number, index: string, type: string, cb: (status: boolean, errMsg?: string) => void) {
    esClient.count({index}, (err, response: { body: ElasticQueryResponse<ItemElastic> }) => {
        if (err) {
            cb(false, 'Error retrieving index count: ' + err);
        } else {
            if (!((response as any).count >= count - 5 && (response as any).count <= count + 5)) {
                cb(false, 'Count mismatch because db count = ' + count + ' and esCount = ' + (response as any).count);
            } else {
                cb(true);
            }
        }
    });
}

export function isElasticUp(cb: Cb1<boolean | void>) {
    esClient.cat.health({h: 'st'}, (err, response) => {
        if (err) {
            statusReport.elastic.up = 'No Response on Health Check: ' + err;
            cb(false);
        } else {
            if (response.body.indexOf('red') === 0) {
                statusReport.elastic.up = false;
                statusReport.elastic.message = 'Cluster status is Red.';
                cb();
            } else if (response.body.indexOf('yellow') === 0) {
                statusReport.elastic.up = true;
                statusReport.elastic.message = 'Cluster status is Yellow.';
                cb();
            } else if (response.body.indexOf('green') === 0) {
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

export async function deleteEsIndex(deleteIndexDone) {
    const clusterIndices = await esClient.cat.indices({format: 'json'});
    for (const index of clusterIndices.body) {
        const found = find(indices, (i) => i.indexName === index.index);
        if (!found) {
            await esClient.indices.delete({index: index.index});
        }
    }
    deleteIndexDone('success.');
}

export function getStatus(getStatusDone: Cb) {
    isElasticUp(() => {
        if (statusReport.elastic.up) {
            const tempIndices: IndexStatus[] = [];
            const condition = {archived: false};
            series([
                done => {
                    dataElementModel.countDocuments(condition, (err, deCount) => {
                        indices[0].totalCount = deCount;
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
                    count(condition, (err, formCount) => {
                        indices[1].totalCount = formCount;
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
                    boardCount({}, (err, boardCount) => {
                        indices[2].totalCount = boardCount;
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

let lastReport: string;
let notificationTimeout: any;

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
                    pushGetAdministratorRegistrations(registrations => {
                        registrations.forEach(r => triggerPushMsg(r, msg));
                    });

                    logError({
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
