import { Request, Response } from 'express';
import * as _ from 'lodash';
import { CastError } from 'mongoose';
import { logError } from 'server/log/dbLogger';
import { noDbLogger } from 'server/system/noDbLogger';
import { AuthenticatedRequest } from 'server/user/authentication';

type HandledError = CastError | Error;

export function forwardError(errCb, cb = _.noop) {
    return function errorHandler(err?: string, ...args) {
        if (err) {
            errCb(err);
            return;
        }
        cb(...args);
    };
}

export function handleConsoleError(options, cb = _.noop) {
    return function errorHandler(err?: string, ...args) {
        if (err) noDbLogger.info('ERROR: ' + err);
        cb(...args);
    };
}

export function handleError(options?: HandlerOptions, cb = _.noop) {
    return function errorHandler(err?: HandledError, ...args) {
        if (err) {
            respondError(err, options);
            return;
        }
        cb(...args);
    };
}

export function handle40x(options, cb) { // Not Found
    return function errorHandler(err?: HandledError, arg?: any, ...args) {
        if (err) {
            respondError(err, options);
            return;
        }
        if (!arg) {
            if (options && options.res) {
                options.res.status(options.statusCode | 404).send();
            }
            return;
        }
        cb(arg, ...args);
    };
}

export type HandlerOptions = {
    details?: string, // private accurate message additional
    message?: string, // private accurate message
    publicMessage?: string, // non-revealing usability message to be shown to users
    req?: Request,
    res?: Response,
};

// TODO: Combine with logError() which publishes notifications
// TODO: tee to console.log
export function respondError(err: HandledError, options?: HandlerOptions) {
    if (!options) options = {};
    if (options.res) {
        if (err.name === 'CastError' && (err as CastError).kind === 'ObjectId') {
            options.res.status(400).send('Invalid id');
            return;
        } else if (err.name === 'ValidationError') {
            options.res.status(422).send(err.message);
            return;
        }
        let message = options.publicMessage || 'Generic Server Failure. Please submit an issue.';
        options.res.status(500).send('Error: ' + message);
    }

    const log: any = {
        message: options.message || err.message || err,
        stack: err.stack || new Error().stack,
        details: options.details
    };
    if (options.req) {
        log.request = {
            url: options.req.url,
            params: JSON.stringify(options.req.params),
            body: JSON.stringify(options.req.body),
            username: (options.req as AuthenticatedRequest).username,
            ip: options.req.ip
        };
    }
    logError(log);
}
