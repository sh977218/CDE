import { Request } from 'express';
import { Model } from 'mongoose';
import { config } from 'server';
import { cdeAuditModel } from 'server/cde/mongo-cde';
import { formAuditModel } from 'server/form/mongo-form';
import {
    clientErrorSchema,
    consoleLogSchema,
    logErrorSchema,
    logSchema,
    loginSchema,
    ClientErrorDocument,
    ErrorLogDocument,
    HttpLogDocument,
    AppLogDocument,
    LoginRecordDocument,
} from 'server/log/schemas';
import { classificationAuditModel } from 'server/system/classificationAuditDb';
import { establishConnection } from 'server/system/connections';
import { noDbLogger } from 'server/system/noDbLogger';
import { getRealIp } from 'server/system/trafficFilterSvc';
import { UserFull } from 'server/user/userDb';
import {
    HttpLogResponse,
    AppLogResponse,
    DailyUsage,
    ServerErrorResponse,
    ClientErrorResponse,
    ServerErrorSearchRequest,
    HttpLogSearchRequest,
    AppLogSearchRequest,
    ItemLogSearchRequest,
    ClientErrorSearchRequest,
    LoginRecordSearchRequest,
    ItemLogResponse,
} from 'shared/log/audit';
import { Cb, CbError } from 'shared/models.model';

const moment = require('moment');
const userAgent = require('useragent');

const conn = establishConnection(config.database.log);
const logModel: Model<HttpLogDocument> = conn.model('DbLogger', logSchema);
export const logErrorModel: Model<ErrorLogDocument> = conn.model('DbErrorLogger', logErrorSchema);
export const clientErrorModel: Model<ClientErrorDocument> = conn.model('DbClientErrorLogger', clientErrorSchema);
const consoleLogModel: Model<AppLogDocument> = conn.model('consoleLogs', consoleLogSchema);
export const loginModel: Model<LoginRecordDocument> = conn.model('logins', loginSchema);

export function consoleLog(message: string, level: 'debug' | 'error' | 'info' | 'warning' = 'debug') {
    // no express errors see dbLogger.log(message)
    new consoleLogModel({ message, level }).save().catch(err => {
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

export function log(message: MorganLogMessage, callback?: CbError) {
    // express only, all others dbLogger.consoleLog(message);
    if ((message.responseTime as any) === '-' || Number.isNaN(message.responseTime)) {
        delete message.responseTime;
    }

    if (message.httpStatus !== '304') {
        new logModel(message).save().catch(err => {
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

export function httpLogs(body: HttpLogSearchRequest): Promise<HttpLogResponse> {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'url';
    const sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition: { [key in string]: RegExp } = {};
    if (body.filterTerm) {
        condition.remoteAddr = new RegExp(body.filterTerm);
    }
    const modal = logModel.find(condition);
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate).startOf('day'));
    }
    if (body.toDate) {
        modal.where('date').lte(moment(body.toDate).endOf('day'));
    }
    return modal
        .clone()
        .countDocuments()
        .exec()
        .then(totalItems =>
            modal
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .limit(itemsPerPage)
                .skip(skip)
                .exec()
                .then(logs => ({
                    logs,
                    totalItems,
                }))
        );
}

export function appLogs(body: AppLogSearchRequest): Promise<AppLogResponse> {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'url';
    const sortDirection = body.sortDir || 'asc';
    const toDate = body.toDate || new Date();
    const skip = currentPage * itemsPerPage;
    const modal = consoleLogModel.find();
    if (body.fromDate) {
        modal.where('date').gte(moment(body.fromDate));
    }
    modal.where('date').lte(moment(toDate));
    return modal
        .clone()
        .countDocuments()
        .exec()
        .then(totalItems =>
            modal
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .limit(itemsPerPage)
                .skip(skip)
                .exec()
                .then(logs => ({
                    logs,
                    totalItems,
                }))
        );
}

export const itemLog = (auditDb: Model<any>, body: ItemLogSearchRequest): Promise<ItemLogResponse> => {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'date';
    const sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition = { 'user.username': { $nin: ['NIH CDE Repository Team'] } };
    if (!body.includeBatchLoader) {
        condition['user.username'].$nin.push('batchloader');
    }
    const modal = auditDb.find(condition, { elements: { $slice: 10 } });
    return modal
        .clone()
        .countDocuments()
        .then(totalItems =>
            modal
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .limit(itemsPerPage)
                .skip(skip)
                .exec()
                .then(logs => ({
                    logs,
                    totalItems,
                }))
        );
};

export const itemLogByModule = (
    module: 'de' | 'form' | 'classification',
    body: ItemLogSearchRequest
): Promise<ItemLogResponse> => {
    const modalMap = {
        de: cdeAuditModel,
        form: formAuditModel,
        classification: classificationAuditModel,
    };
    return itemLog(modalMap[module], body);
};

export function serverErrors(body: ServerErrorSearchRequest): Promise<ServerErrorResponse> {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'date';
    const sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition: {
        [key in string]: {
            [key in string]: boolean;
        };
    } = {
        badInput: { $ne: true },
    };
    if (body.includeBadInput) {
        delete condition.badInput;
    }
    const modal = logErrorModel.find(condition);
    return modal
        .clone()
        .countDocuments()
        .exec()
        .then(totalItems =>
            modal
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .limit(itemsPerPage)
                .skip(skip)
                .exec()
                .then(logs => ({
                    logs,
                    totalItems,
                }))
        );
}

export function clientErrors(body: ClientErrorSearchRequest): Promise<ClientErrorResponse> {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'date';
    const sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const condition: {
        [key in string]: {
            [key in string]: string[];
        };
    } = {
        userAgent: { $in: body.includeUserAgents },
    };
    const modal = clientErrorModel.find(condition);
    return modal
        .clone()
        .countDocuments()
        .then(totalItems =>
            modal
                .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
                .limit(itemsPerPage)
                .skip(skip)
                .exec()
                .then(logs => ({
                    logs,
                    totalItems,
                }))
        );
}

export async function loginRecord(body: LoginRecordSearchRequest) {
    const currentPage = body.currentPage || 0;
    const itemsPerPage = body.pageSize || 50;
    const sortBy = body.sortBy || 'url';
    const sortDirection = body.sortDir || 'asc';
    const skip = currentPage * itemsPerPage;
    const modal = loginModel.find();
    const totalItems = await modal.clone().countDocuments();
    const logs = await modal
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .limit(itemsPerPage)
        .skip(skip)
        .exec();
    return { logs, totalItems };
}

export function logError(message: ErrorMessage) {
    // all server errors, express and not
    if (!message.date) {
        message.date = new Date();
    }
    if (typeof message.stack === 'string') {
        message.stack = message.stack.substr(0, 1500);
    }
    if (config.logToConsoleForServerError) {
        console.log('---Server Error---');
        console.log(message);
        console.log('--- END Server Error---');
    }
    new logErrorModel(message).save().then(
        () => {},
        err => {
            noDbLogger.info('ERROR Cannot log to DB (3): ' + err);
        }
    );
}

export function logClientError(req: Request, done: Cb) {
    const clientErrorLog = req.body;
    const ua = userAgent.is(req.headers['user-agent']);
    if (ua.chrome) {
        clientErrorLog.userAgent = 'chrome';
    }
    if (ua.firefox) {
        clientErrorLog.userAgent = 'firefox';
    }
    if (ua.safari) {
        clientErrorLog.userAgent = 'safari';
    }
    if (ua.ie) {
        clientErrorLog.userAgent = 'ie';
    }
    clientErrorLog.date = new Date();
    clientErrorLog.ip = getRealIp(req);
    if (req.user) {
        clientErrorLog.username = req.user.username;
    }
    new clientErrorModel(clientErrorLog).save().then(done, err => {
        noDbLogger.info('ERROR: ' + err);
    });
}

export function getClientErrorsNumber(user: UserFull): Promise<number> {
    const condition =
        user.notificationDate && user.notificationDate.clientLogDate
            ? { date: { $gt: user.notificationDate.clientLogDate } }
            : {};
    return clientErrorModel.countDocuments(condition).exec();
}

export function getServerErrorsNumber(user: UserFull): Promise<number> {
    const condition =
        user.notificationDate && user.notificationDate.serverLogDate
            ? ({ date: { $gt: user.notificationDate.serverLogDate } } as any)
            : {};
    return logErrorModel.countDocuments(condition).exec();
}

export function usageByDay(numberOfDays: number = 3): Promise<DailyUsage[]> {
    const d = new Date();
    d.setDate(d.getDate() - numberOfDays);
    //noinspection JSDuplicatedDeclaration
    return logModel.aggregate([
        { $match: { $and: [{ date: { $exists: true } }, { date: { $gte: d } }] } },
        {
            $group: {
                _id: {
                    ip: '$remoteAddr',
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    day: { $dayOfMonth: '$date' },
                } as any,
                hits: { $sum: 1 },
                latestDate: { $max: '$date' },
            },
        },
    ]);
}

export function recordUserLogin(user: UserFull, ip: string) {
    new loginModel({ user: user.username, email: user.email, ip }).save();
}
