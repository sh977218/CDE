import { Request } from 'express';
import { config } from 'server/system/parseConfig';
import { CbError, CbError1 } from 'shared/models.model';
import { transports, Logger, Transport } from 'winston';

const util = require('util');
const dbLogger = require('../log/dbLogger');
const noDbLogger = require('./noDbLogger');

export const mongoLogger = (transports as any).MongoLogger = function(options: any) {
    this.name = 'mongoLogger';
    this.json = true;
    this.level = options.level || 'info';
};

export const mongoErrorLogger = (transports as any).MongoErrorLogger = function(options: any) {
    this.name = 'mongoErrorLogger';
    this.json = true;
    this.level = options.level || 'error';
};

util.inherits(mongoLogger, Transport);
util.inherits(mongoErrorLogger, Transport);

mongoLogger.prototype.log = (level: string, msg: string, meta: any, callback: CbError1<boolean>) => {
    try {
        const logEvent = JSON.parse(msg);
        logEvent.level = level;
        dbLogger.log(logEvent, (err?: Error) => {
            if (err) {
                noDbLogger.noDbLogger.error('Cannot log to DB (1): ' + err);
            }
            callback(null, true);
        });
    } catch (e) {
        noDbLogger.noDbLogger.error('Cannot log to DB (2): ' + e);
    }
};

mongoErrorLogger.prototype.log = (level: string, msg: string, meta: any) => {
    if (!meta) {
        meta = {};
    }
    function processDetails(details: any) {
        if (!details) {
            return 'No details provided.';
        }
        if (typeof details === 'string') {
            return details;
        }
        if (typeof details !== 'object') {
            return 'No details provided.';
        }
        Object.keys(details).map(name => {
            const value = details[name];
            if (typeof value === 'string') {
                return name + '=' + value;
            }
            if (typeof value === 'object' && typeof value.toString === 'function') {
                return name + '=' + value.toString();
            }
            if (typeof value === 'object' && typeof value.name !== 'undefined') {
                return name + '=' + value.name;
            }
            try {
                return name + '=' + JSON.stringify(value);
            } catch (e) {
                return 'Error in logger: Cannot process details. Cannot parse JSON.';
            }
        });
    }
    try {
        const message: any = {
            message: msg,
            origin: meta.origin,
            stack: meta.stack || new Error().stack,
            details: processDetails(meta.details),
        };
        if (meta.request) {
            message.request = generateErrorLogRequest(meta.request);
        }
        dbLogger.logError(message, (err?: Error) => {
            if (err) {
                noDbLogger.noDbLogger.error('Cannot log to DB (3): ' + msg);
            }
        });
    } catch (e) {
        noDbLogger.noDbLogger.error('Cannot log to DB (4): ' + e);
    }
};

const expressLoggerCnf = {
    transports: [
        // @ts-ignore
        new mongoLogger({
            json: true
        })
    ]
};

const expressErrorLoggerCnf = {
    transports: [
        // @ts-ignore
        new mongoErrorLogger({
            json: true
        })
    ]
};

if (config.expressToStdout) {
    const consoleLogCnf = {
        level: 'verbose',
        colorize: true,
        timestamp: true
    };
    expressLoggerCnf.transports.push(new transports.Console(consoleLogCnf));
    expressErrorLoggerCnf.transports.push(new transports.Console(consoleLogCnf));
}

export const expressLogger = new (Logger)(expressLoggerCnf);
export const errorLogger = new (Logger)(expressErrorLoggerCnf);

export function generateErrorLogRequest(req: Request) {
    let body;
    let method;
    let url;
    let username;
    try {
        url = req.url;
        method = req.method;
        body = JSON.stringify(req.body);
        if (req.user) {
            username = req.user.username;
        }
    } catch (e) {}
    return {
        url,
        method,
        body,
        username,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    };
}
