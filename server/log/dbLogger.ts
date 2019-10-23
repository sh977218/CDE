import { Document, Model } from 'mongoose';
import { handleConsoleError, handleError } from 'server/errorHandler/errorHandler';
import {
    clientErrorSchema, consoleLogSchema, feedbackIssueSchema, logErrorSchema, logSchema
} from 'server/log/schemas';
import { pushGetAdministratorRegistrations } from 'server/notification/notificationDb';
import { triggerPushMsg } from 'server/notification/pushNotificationSvc';
import { establishConnection } from 'server/system/connections';
import { noDbLogger } from 'server/system/noDbLogger';
import { config } from 'server/system/parseConfig';
import { UserFull } from 'server/user/userDb';
import { Cb, CbError } from 'shared/models.model';

export interface ClientError {
    message: string;
    date: Date | number;
    origin: string;
    name: string;
    stack: string;
    userAgent: string;
    url: string;
    username: string;
    ip: string;
}

export type ClientErrorDocument = Document & ClientError;

const moment = require('moment');
const conn = establishConnection(config.database.log);
const LogModel = conn.model('DbLogger', logSchema);
export const logErrorModel = conn.model('DbErrorLogger', logErrorSchema);
export const clientErrorModel: Model<ClientErrorDocument> = conn.model('DbClientErrorLogger', clientErrorSchema);
const FeedbackModel = conn.model('FeedbackIssue', feedbackIssueSchema);
const consoleLogModel = conn.model('consoleLogs', consoleLogSchema);
const userAgent = require('useragent');

export function consoleLog(message, level: 'debug' | 'error' | 'info' | 'warning' = 'debug') {
    // no express errors see dbLogger.log(message)
    new consoleLogModel({message, level}).save(err => {
        if (err) {
            noDbLogger.error('Cannot log to DB: ' + err);
        }
    });
}

export function log(message, callback?: CbError) { // express only, all others dbLogger.consoleLog(message);
    if (isNaN(message.responseTime)) {
        delete message.responseTime;
    }

    if (message.httpStatus !== '304') {
        new LogModel(message).save(err => {
            if (err) {
                noDbLogger.info('ERROR: ' + err);
            }
            if (callback) {
                callback(err);
            }
        });
    }
}

export function logError(message, callback?: Cb) { // all server errors, express and not
    message.date = new Date();
    if (typeof message.stack === 'string') {
        message.stack = message.stack.substr(0, 1000);
    }
    const description = ((message.message || message.publicMessage) + '').substr(0, 30);
    if (config.logToConsoleForServerError) {
        console.log('---Server Error---');
        console.log(message);
        console.log('--- END Server Error---');
    }
    new logErrorModel(message).save(handleConsoleError({}, () => {
        if (message.origin && message.origin.indexOf('pushGetAdministratorRegistrations') === -1) {
            const msg = JSON.stringify({
                title: 'Server Side Error',
                options: {
                    body: description,
                    icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
                    tag: 'cde-server-side',
                    actions: [
                        {
                            action: 'audit-action',
                            title: 'View',
                            icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
                        }
                    ]
                }
            });
            pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => triggerPushMsg(r, msg));
            });
        }
        if (callback) {
            callback();
        }
    }));
}

export function logClientError(req, callback) {
    const getRealIp = req => req._remoteAddress;
    const exc = req.body;
    exc.userAgent = req.headers['user-agent'];
    exc.date = new Date();
    exc.ip = getRealIp(req);
    if (req.user) {
        exc.username = req.user.username;
    }
    new clientErrorModel(exc).save(handleConsoleError<ClientErrorDocument>({}, () => {
        const ua = userAgent.is(req.headers['user-agent']);
        if (ua.chrome || ua.firefox || ua.edge) {
            const msg = JSON.stringify({
                title: 'Client Side Error',
                options: {
                    body: (exc.message || '').substr(0, 30),
                    icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
                    tag: 'cde-client-side',
                    actions: [
                        {
                            action: 'audit-action',
                            title: 'View',
                            icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
                        }
                    ]
                }
            });
            pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => triggerPushMsg(r, msg));
            });
        }

        callback();
    }));
}

export function httpLogs(body, callback) {
    let sort = {date: 'desc'};
    if (body.sort) {
        sort = body.sort;
    }
    let currentPage = 0;
    if (body.currentPage) {
        currentPage = parseInt(body.currentPage, 10);
    }
    const itemsPerPage = 200;
    const skip = currentPage * itemsPerPage;
    let query = {};
    if (body.ipAddress) {
        query = {remoteAddr: body.ipAddress};
    }
    const modal = LogModel.find(query);
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    if (body.toDate) {
        modal.where('date').lte(moment(body.toDate));
    }
    LogModel.countDocuments({}, (err, count) => {
        modal.sort(sort).limit(itemsPerPage).skip(skip).exec((err, logs) => {
            callback(err, {
                logs,
                sort,
                totalItems: body.totalItems ? undefined : count
            });
        });
    });
}

export function appLogs(body, callback) {
    let currentPage = 0;
    if (body.currentPage) {
        currentPage = parseInt(body.currentPage, 10);
    }
    const itemsPerPage = 50;
    const skip = currentPage * itemsPerPage;
    const modal = consoleLogModel.find();
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    if (body.toDate) {
        modal.where('date').lte(moment(body.toDate));
    }
    consoleLogModel.countDocuments({}, (err, count) => {
        modal.sort({date: -1}).limit(itemsPerPage).skip(skip).exec((err, logs) => {
            callback(err, {
                logs,
                totalItems: count
            });
        });
    });
}

export function getClientErrors(params: { limit?: number, skip?: number }, callback: CbError<ClientErrorDocument[]>) {
    clientErrorModel.find().sort('-date').skip(params.skip).limit(params.limit).exec(callback);
}

export function getClientErrorsNumber(user: UserFull): Promise<number> {
    return clientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    ).exec();
}

export function getServerErrors(params, callback) {
    if (!params.limit) {
        params.limit = 20;
    }
    if (!params.skip) {
        params.skip = 0;
    }
    const filter: any = {};
    if (params.excludeOrigin && params.excludeOrigin.length > 0) {
        filter.origin = {$nin: params.excludeOrigin};
    }
    logErrorModel
        .find(filter)
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
}

export function getServerErrorsNumber(user: UserFull): Promise<number> {
    return logErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {}
    ).exec();
}

export function getFeedbackIssues(params, callback) {
    FeedbackModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
}

export function usageByDay(callback) {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    //noinspection JSDuplicatedDeclaration
    LogModel.aggregate([
        // @ts-ignore
        {$match: {date: {$exists: true}, date: {$gte: d}}},
        {
            $group: {
                _id: {
                    ip: '$remoteAddr',
                    year: {$year: '$date'},
                    month: {$month: '$date'},
                    dayOfMonth: {$dayOfMonth: '$date'}
                }, number: {$sum: 1}, latest: {$max: '$date'}
            }
        }], callback);
}

export function saveFeedback(req, cb) {
    const report = JSON.parse(req.body.feedback);
    const issue = new FeedbackModel({
        user: {username: req.user && req.user._doc ? req.user._doc.username : null}
        , rawHtml: report.html
        , reportedUrl: report.url
        , userMessage: report.note
        , screenshot: {content: report.img}
        , browser: report.browser.userAgent
    });
    issue.save(cb);
}
