import { Request } from 'express';
import { Document, Model } from 'mongoose';
import { handleConsoleError } from 'server/errorHandler/errorHandler';
import {
    clientErrorSchema, consoleLogSchema, logErrorSchema, logSchema
} from 'server/log/schemas';
import { pushRegistrationsFor } from 'server/notification/notificationDb';
import { triggerPushMsg } from 'server/notification/pushNotificationSvc';
import { establishConnection } from 'server/system/connections';
import { noDbLogger } from 'server/system/noDbLogger';
import { config } from 'server/system/parseConfig';
import { siteAdmins, UserFull } from 'server/user/userDb';
import { Cb, CbError, CbError1 } from 'shared/models.model';
import { AuditLog, AuditLogResponse, LogMessage } from 'shared/log/audit';

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

export interface ConsoleLog {
    date: number;
    message: string;
    level: 'debug' | 'info' | 'warning' | 'error';
}

export interface ErrorLog {
    message: string;
    date: Date;
    details?: string;
    origin: string;
    stack: string;
    request?: {
        url: string;
        method: string;
        params: string;
        body: string;
        username: string;
        userAgent: string;
        ip: string;
        errorCode: string;
        errorType: string;
    };
}

const moment = require('moment');
const conn = establishConnection(config.database.log);
const logModel: Model<Document & LogMessage> = conn.model('DbLogger', logSchema);
export const logErrorModel: Model<Document & ErrorLog> = conn.model('DbErrorLogger', logErrorSchema);
export const clientErrorModel: Model<ClientErrorDocument> = conn.model('DbClientErrorLogger', clientErrorSchema);
const consoleLogModel: Model<Document & ConsoleLog> = conn.model('consoleLogs', consoleLogSchema);
const userAgent = require('useragent');

export function consoleLog(message: string, level: 'debug' | 'error' | 'info' | 'warning' = 'debug') {
    // no express errors see dbLogger.log(message)
    new consoleLogModel({message, level}).save(err => {
        if (err) {
            noDbLogger.error('Cannot log to DB: ' + err);
        }
    });
}

interface MorganLogMessage {
    remoteAddr: string;
    url: string;
    method: string;
    httpStatus: string;
    date: number;
    referrer: string;
    responseTime?: number;
}

export function log(message: MorganLogMessage, callback?: CbError) { // express only, all others dbLogger.consoleLog(message);
    if (Number.isNaN(message.responseTime)) {
        delete message.responseTime;
    }

    if (message.httpStatus !== '304') {
        new logModel(message).save(err => {
            if (err) {
                noDbLogger.info('ERROR: ' + err);
            }
            if (callback) {
                callback(err);
            }
        });
    }
}

interface ErrorMessage {
    date?: Date;
    details?: string;
    message?: string;
    origin?: string;
    publicMessage?: string;
    request?: {
        url: string;
        params: string;
        body: string;
        username: string;
        ip: string;
    };
    stack?: string;
}

export function logError(message: ErrorMessage, callback?: Cb) { // all server errors, express and not
    if (!message.date) {
        message.date = new Date();
    }
    if (typeof message.stack === 'string') {
        message.stack = message.stack.substr(0, 1000);
    }
    const description = ((message.message || message.publicMessage) + '').substr(0, 30);
    if (config.logToConsoleForServerError) {
        console.log('---Server Error---');
        console.log(message);
        console.log('--- END Server Error---');
    }
    new logErrorModel(message).save(handleConsoleError<Document & ErrorLog>({}, () => {
        if (message.origin && message.origin.indexOf('pushGetAdministratorRegistrations') === -1) {
            const msg = JSON.stringify({
                title: 'Server Side Error',
                options: {
                    body: description,
                    icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
                    tag: 'cde-server-side',
                    actions: [
                        {
                            action: 'audit-action',
                            title: 'View',
                            icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
                        }
                    ]
                }
            });
            pushRegistrationsFor(siteAdmins, registrations => {
                registrations.forEach(r => triggerPushMsg(r, msg));
            });
        }
        if (callback) {
            callback();
        }
    }));
}

export function logClientError(req: Request, done: Cb) {
    const getRealIp = (req: any) => req._remoteAddress;
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
                    icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
                    tag: 'cde-client-side',
                    actions: [
                        {
                            action: 'audit-action',
                            title: 'View',
                            icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
                        }
                    ]
                }
            });
            pushRegistrationsFor(siteAdmins, registrations => {
                registrations.forEach(r => triggerPushMsg(r, msg));
            });
        }

        done();
    }));
}

export function httpLogs(body: AuditLog, callback: CbError1<AuditLogResponse>) {
    let sort = {date: 'desc'};
    if (body.sort) {
        sort = body.sort;
    }
    let currentPage = 0;
    if (body.currentPage) {
        currentPage = parseInt(body.currentPage + '', 10);
    }
    const itemsPerPage = 200;
    const skip = currentPage * itemsPerPage;
    let query = {};
    if (body.ipAddress) {
        query = {remoteAddr: body.ipAddress};
    }
    const modal = logModel.find(query);
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    if (body.toDate) {
        modal.where('date').lte(moment(body.toDate));
    }
    logModel.countDocuments({}, (err, count) => {
        modal.sort(sort).limit(itemsPerPage).skip(skip).exec((err, logs) => {
            callback(err, {
                logs,
                sort,
                totalItems: body.totalItems ? undefined : count
            });
        });
    });
}

export function appLogs(body: { currentPage: string, fromDate: number, toDate: number },
                        callback: CbError1<{ logs: (Document & ConsoleLog)[], totalItems: number }>) {
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

export function getClientErrors(params: { limit: number, skip: number }, callback: CbError1<ClientErrorDocument[]>) {
    clientErrorModel.find().sort('-date').skip(params.skip).limit(params.limit).exec(callback);
}

export function getClientErrorsNumber(user: UserFull): Promise<number> {
    return clientErrorModel.countDocuments(
        user.notificationDate && user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    ).exec();
}

export function getServerErrors(params: { limit: number, skip: number, badInput: boolean, excludeOrigin: string[] },
                                callback: CbError1<(Document & ErrorMessage)[]>) {
    if (!params.limit) {
        params.limit = 20;
    }
    if (!params.skip) {
        params.skip = 0;
    }
    if (!params.badInput) {
        params.badInput = false;
    }
    const filter: any = {
        badInput: {
            $ne: true
        }
    };
    if (params.badInput) {
        delete filter.badInput;
    }
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
        user.notificationDate && user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}} as any
            : {}
    ).exec();
}

interface LogAggregate {
    _id: { ip: string, year: number, month: number, dayOfMonth: number };
    number: number;
    latest: number;
}

export function usageByDay(callback: CbError1<LogAggregate>) {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    //noinspection JSDuplicatedDeclaration
    logModel.aggregate([
        {$match: {$and: [{date: {$exists: true}}, {date: {$gte: d}}]}},
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

