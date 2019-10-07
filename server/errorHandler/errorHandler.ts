import { Request, Response } from 'express';
import { noop } from 'lodash';
import { CastError } from 'mongoose';
import { logError } from 'server/log/dbLogger';
import { noDbLogger } from 'server/system/noDbLogger';
import { AuthenticatedRequest } from 'server/system/authentication';
import { Cb, Cb1, CbError, CbError1, CbErrorObj, CbErrorObj1, CbErrorObj3 } from 'shared/models.model';

type HandledError = CastError | Error;
type AllErrors = HandledError | null | undefined;

export interface HandlerOptions {
    details?: string; // private accurate message additional
    message?: string; // private accurate message
    publicMessage?: string; // non-revealing usability message to be shown to users
    req?: Request;
    res?: Response;
    statusCode?: number;
}

export function handleConsoleError<T = undefined, U = undefined, V = undefined>(options?: HandlerOptions,
                                                                                cb: Cb<T, U, V> = noop): CbErrorObj<AllErrors, T, U, V> {
    return function errorHandler(err: AllErrors | undefined,
                                 arg1: T | undefined = undefined,
                                 arg2: U | undefined = undefined,
                                 arg3: V | undefined = undefined) {
        if (err) {
            noDbLogger.info('ERROR: ' + err);
        }
        cb(arg1, arg2, arg3);
    };
}

export function handleError<T, U = void, V = void>(options?: HandlerOptions, cb: Cb<T, U, V> = noop): CbErrorObj<AllErrors, T, U, V> {
    return function errorHandler(err: AllErrors | undefined, arg1?: T, arg2?: U, arg3?: V) {
        if (err) {
            respondError(err, options);
            return;
        }
        cb(arg1, arg2, arg3);
    };
}

export function handleNotFound<T, U = void, V = void>(options?: HandlerOptions,
                                                      cb: Cb1<T & {}, U, V> = noop): CbErrorObj1<AllErrors, T, U, V> {
    return function errorHandler(err: AllErrors, arg1: T, arg2?: U, arg3?: V) {
        if (err) {
            respondError(err, options);
            return;
        }
        if (!arg1) {
            if (options && options.res) {
                options.res.status(options.statusCode || 404).send();
            }
            return;
        }
        cb(arg1, arg2, arg3);
    };
}

// TODO: Combine with logError() which publishes notifications
// TODO: tee to console.log
export function respondError(err: HandledError, options?: HandlerOptions) {
    if (!options) {
        options = {};
    }
    if (options.res) {
        if (err.name === 'CastError' && (err as CastError).kind === 'ObjectId') {
            options.res.status(400).send('Invalid id');
            return;
        } else if (err.name === 'ValidationError') {
            options.res.status(422).send(err.message);
            return;
        }
        const message = options.publicMessage || 'Generic Server Failure. Please submit an issue.';
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

export function splitError<T = undefined, U = undefined, V = undefined>(errCb: CbError<any, any, any>,
                                                                        cb: Cb<T, U, V> = noop): CbErrorObj<AllErrors, T, U, V> {
    return function errorHandler(err: AllErrors | undefined,
                                 arg1: T | undefined = undefined,
                                 arg2: U | undefined = undefined,
                                 arg3: V | undefined = undefined) {
        if (err) {
            errCb(err);
            return;
        }
        cb(arg1, arg2, arg3);
    };
}
