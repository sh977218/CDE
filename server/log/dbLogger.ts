import {Request} from 'express';
import {Document, Model} from 'mongoose';
import {config} from 'server';
import {handleConsoleError} from 'server/errorHandler';
import {
    clientErrorSchema, consoleLogSchema, logErrorSchema, logSchema, loginSchema
} from 'server/log/schemas';
import {establishConnection} from 'server/system/connections';
import {noDbLogger} from 'server/system/noDbLogger';
import {UserFull} from 'server/user/userDb';
import {
    HttpLog,
    HttpLogResponse,
    AppLog,
    AppLogResponse,
    DailyUsage,
    ServerErrorResponse,
    ClientError,
    ClientErrorResponse,
    LoginRecord
} from 'shared/log/audit';
import {Cb, CbError, CbError1} from 'shared/models.model';

export type ClientErrorDocument = Document & ClientError;

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
const userAgent = require('useragent');
const conn = establishConnection(config.database.log);
const logModel: Model<Document & HttpLog> = conn.model('DbLogger', logSchema);
export const logErrorModel: Model<Document & ErrorLog> = conn.model('DbErrorLogger', logErrorSchema);
export const clientErrorModel: Model<ClientErrorDocument> = conn.model('DbClientErrorLogger', clientErrorSchema);
const consoleLogModel: Model<Document & AppLog> = conn.model('consoleLogs', consoleLogSchema);
export const loginModel: Model<Document & LoginRecord> = conn.model('logins', loginSchema);

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
    if (message.responseTime as any === '-' || Number.isNaN(message.responseTime)) {
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

export function httpLogs(body: {
                             filterTerm: string,
                             currentPage: number,
                             pageSize: number,
                             fromDate: Date,
                             toDate: Date,
                             sortBy: string,
                             sortDir: string
                         },
                         callback: CbError1<HttpLogResponse>) {
    let currentPage = body.currentPage || 0;
    let itemsPerPage = body.pageSize || 50;
    let sortBy = body.sortBy || 'url';
    let sortDirection = body.sortDir || 'asc';
    let toDate = body.toDate || new Date()
    const skip = currentPage * itemsPerPage;
    const condition: { [key in string]: RegExp } = {};
    if (body.filterTerm) {
        condition.remoteAddr = new RegExp(body.filterTerm);
    }
    const modal = logModel.find(condition);
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    modal.where('date').lte(moment(toDate));
    modal.clone().count((err, totalItems) => {
        modal.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .limit(itemsPerPage)
            .skip(skip)
            .exec((err, logs) => {
                callback(err, {
                    logs,
                    totalItems
                });
            });
    });
}

export function appLogs(body: {
                            currentPage: number,
                            pageSize: number,
                            fromDate: Date,
                            toDate: Date,
                            sortBy: string,
                            sortDir: string
                        },
                        callback: CbError1<AppLogResponse>) {
    let currentPage = body.currentPage || 0;
    let itemsPerPage = body.pageSize || 50;
    let sortBy = body.sortBy || 'url';
    let sortDirection = body.sortDir || 'asc';
    let toDate = body.toDate || new Date()
    const skip = currentPage * itemsPerPage;
    const modal = consoleLogModel.find();
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    modal.where('date').lte(moment(toDate));
    modal.clone().count((err, totalItems) => {
        modal.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .limit(itemsPerPage)
            .skip(skip)
            .exec((err, logs) => {
                callback(err, {
                    logs,
                    totalItems
                });
            });
    });
}

export function serverErrors(body: {
                                 includeBadInput: boolean,
                                 currentPage: number,
                                 pageSize: number,
                                 sortBy: string,
                                 sortDir: string
                             },
                             callback: CbError1<ServerErrorResponse>) {
    let currentPage = body.currentPage || 0;
    let itemsPerPage = body.pageSize || 50;
    let sortBy = body.sortBy || 'date';
    let sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition: {
        [key in string]: {
            [key in string]: boolean
        }
    } = {
        badInput: {$ne: true}
    };
    if (body.includeBadInput) {
        delete condition.badInput;
    }
    const modal = logErrorModel.find(condition);
    modal.clone().count((err, totalItems) => {
        modal.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .limit(itemsPerPage)
            .skip(skip)
            .exec((err, logs) => {
                callback(err, {
                    logs,
                    totalItems
                });
            });
    });
}

export function clientErrors(body: {
                                 includeUserAgents: string[],
                                 currentPage: number,
                                 pageSize: number,
                                 sortBy: string,
                                 sortDir: string
                             },
                             callback: CbError1<ClientErrorResponse>) {
    let currentPage = body.currentPage || 0;
    let itemsPerPage = body.pageSize || 50;
    let sortBy = body.sortBy || 'date';
    let sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition: {
        [key in string]: {
            [key in string]: string[]
        }
    } = {
        userAgent: {$in: body.includeUserAgents}
    };
    const modal = clientErrorModel.find(condition);
    modal.clone().count((err, totalItems) => {
        modal.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .limit(itemsPerPage)
            .skip(skip)
            .exec((err, logs) => {
                callback(err, {
                    logs,
                    totalItems
                });
            });
    });
}

export async function loginRecord(body: {
    currentPage: number,
    pageSize: number,
    sortBy: string,
    sortDir: string
}) {
    let currentPage = body.currentPage || 0;
    let itemsPerPage = body.pageSize || 50;
    let sortBy = body.sortBy || 'url';
    let sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const modal = loginModel.find();
    const totalItems = await modal.clone().count();
    const logs = await modal.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
        .limit(itemsPerPage)
        .skip(skip)
        .exec();
    return {logs, totalItems}
}

export function logError(message: ErrorMessage, callback?: Cb) { // all server errors, express and not
    if (!message.date) {
        message.date = new Date();
    }
    if (typeof message.stack === 'string') {
        message.stack = message.stack.substr(0, 1500);
    }
    const description = ((message.message || message.publicMessage) + '').substr(0, 100);
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
                    icon: '/assets/img/NIH-CDE.png',
                    badge: '/assets/img/NIH-CDE-Logo-Simple.png',
                    tag: 'cde-server-side',
                    actions: [
                        {
                            action: 'audit-action',
                            title: 'View',
                            icon: '/assets/img/NIH-CDE-Logo-Simple.png'
                        }
                    ]
                }
            });
        }
        if (callback) {
            callback();
        }
    }));
}

export function logClientError(req: Request, done: Cb) {
    const getRealIp = (req: any) => req._remoteAddress;
    const clientErrorLog = req.body;
    const ua = userAgent.is(req.headers['user-agent']);
    if (ua.chrome) {
        clientErrorLog.userAgent = 'chrome'
    }
    if (ua.firefox) {
        clientErrorLog.userAgent = 'firefox'
    }
    if (ua.safari) {
        clientErrorLog.userAgent = 'safari'
    }
    if (ua.ie) {
        clientErrorLog.userAgent = 'ie'
    }
    clientErrorLog.date = new Date();
    clientErrorLog.ip = getRealIp(req);
    if (req.user) {
        clientErrorLog.username = req.user.username;
    }
    new clientErrorModel(clientErrorLog).save(handleConsoleError<ClientErrorDocument>({}, () => {
        done();
    }));
}

export function getClientErrorsNumber(user: UserFull, callback: (error: Error | null, n: number) => void) {
    const condition = user.notificationDate && user.notificationDate.clientLogDate
        ? {date: {$gt: user.notificationDate.clientLogDate}}
        : {};
    clientErrorModel.countDocuments(condition).exec(callback);
}

export function getServerErrorsNumber(user: UserFull, callback: (error: Error | null, n: number) => void) {
    const condition = user.notificationDate && user.notificationDate.serverLogDate
        ? {date: {$gt: user.notificationDate.serverLogDate}} as any
        : {};
    logErrorModel.countDocuments(condition).exec(callback);
}

export function usageByDay(numberOfDays: number = 3, callback: CbError1<DailyUsage[]>) {
    const d = new Date();
    d.setDate(d.getDate() - numberOfDays);
    //noinspection JSDuplicatedDeclaration
    logModel.aggregate([
        {$match: {$and: [{date: {$exists: true}}, {date: {$gte: d}}]}},
        {
            $group: {
                _id: {
                    ip: '$remoteAddr',
                    year: {$year: '$date'},
                    month: {$month: '$date'},
                    day: {$dayOfMonth: '$date'}
                } as any, hits: {$sum: 1}, latestDate: {$max: '$date'}
            }
        }], callback);
}

export function recordUserLogin(user: UserFull, ip: string) {
    new loginModel({user: user.username, email: user.email, ip}).save();
}

