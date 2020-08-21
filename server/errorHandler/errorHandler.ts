import { Request, Response } from 'express';
import { noop } from 'lodash';
import { CastError } from 'mongoose';
import { logError } from 'server/log/dbLogger';
import { noDbLogger } from 'server/system/noDbLogger';
import { AuthenticatedRequest } from 'server/user/authentication';
import { Cb, Cb1, CbError1, CbErrorObj, CbErrorObj1 } from 'shared/models.model';

type HandledError = CastError | Error;

export interface HandlerOptions {
    details?: string; // private accurate message additional
    message?: string; // private accurate message
    publicMessage?: string; // non-revealing usability message to be shown to users
    req?: Request;
    res?: Response;
    statusCode?: number;
}

export function handleConsoleError<T>(options?: HandlerOptions, cb: Cb1<T> = noop): CbErrorObj1<HandledError | null, T> {
    return (err: HandledError | null, arg1: T) => {
        if (err) {
            noDbLogger.info('ERROR: ' + err);
        }
        cb(arg1);
    };
}

export function handleErr<T>(options?: HandlerOptions, cb: Cb1<T> = noop): CbErrorObj1<string, T> {
    return function errorHandler(err: string | undefined, arg1: T) {
        if (err) {
            respondError(new Error(err), options);
            return;
        }
        cb(arg1);
    };
}

export function handleErrVoid(options?: HandlerOptions, cb: Cb = noop): CbErrorObj {
    return function errorHandler(err: string | undefined) {
        if (err) {
            respondError(new Error(err), options);
            return;
        }
        cb();
    };
}

export function handleError<T>(options?: HandlerOptions, cb: Cb1<T> = noop): CbErrorObj1<HandledError | null, T> {
    return function errorHandler(err: HandledError | null, arg1: T) {
        if (err) {
            respondError(err, options);
            return;
        }
        cb(arg1);
    };
}

export function handleErrorVoid(options?: HandlerOptions, cb: Cb = noop): CbErrorObj<HandledError | null> {
    return function errorHandler(err: HandledError | null) {
        if (err) {
            respondError(err, options);
            return;
        }
        cb();
    };
}

export function handleNotFound<T>(options?: HandlerOptions,
                                  cb: Cb1<NonNullable<Exclude<T, void>>> = noop): CbErrorObj1<HandledError | null, T> {
    return function errorHandler(err: HandledError | null, arg1: T) {
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
        cb(arg1 as NonNullable<Exclude<T, void>>);
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
        details: options.details,
    };
    if (options.req) {
        log.request = {
            url: options.req.url,
            params: JSON.stringify(options.req.params),
            body: JSON.stringify(options.req.body),
            username: (options.req as AuthenticatedRequest).username,
            ip: options.req.ip,
        };
    }
    logError(log);
}

export function splitError<T = void, U = void, V = void>(errCb: CbError1<T>, cb: Cb1<T> = noop): CbErrorObj1<HandledError | null, T> {
    return function errorHandler(err: HandledError | null, arg1: T) {
        if (err) {
            errCb(err, arg1);
            return;
        }
        cb(arg1);
    };
}
