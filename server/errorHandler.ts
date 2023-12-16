import { Request, Response } from 'express';
import { CastError } from 'mongoose';
import { logError } from 'server/log/dbLogger';
import { noDbLogger } from 'server/system/noDbLogger';
import { AuthenticatedRequest } from 'server/user/authentication';
import { Cb, Cb1, CbError1, CbErrorObj, CbErrorObj1 } from 'shared/models.model';
import { noop } from 'shared/util';

type HandledError = CastError | Error;

interface HandlerOptionsNoRes {
    details?: string; // private accurate message additional
    message?: string; // private accurate message
    origin?: string; // unique to calling code
    publicMessage?: string; // non-revealing usability message to be shown to users
    req?: Request<any, any, any, any>;
    statusCode?: number;
}

type HandlerOptionsRes = HandlerOptionsNoRes & {res: Response};
export type HandlerOptions = HandlerOptionsNoRes | HandlerOptionsRes;

function hasRes(options: HandlerOptions): options is HandlerOptionsRes {
    return !!(options as HandlerOptionsRes).res;
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
            respondError(options)(new Error(err));
            return;
        }
        cb(arg1);
    };
}

export function handleError<T>(options?: HandlerOptions, cb: Cb1<T> = noop): CbErrorObj1<HandledError | null, T> {
    return function errorHandler(err: HandledError | null, arg1: T) {
        if (err) {
            respondError(options)(err);
            return;
        }
        cb(arg1);
    };
}

export function handleErrorVoid(options?: HandlerOptions, cb: Cb = noop): CbErrorObj<HandledError | null> {
    return function errorHandler(err: HandledError | null) {
        if (err) {
            respondError(options)(err);
            return;
        }
        cb();
    };
}

export function handleNotFound<T>(options?: HandlerOptions,
                                  cb: Cb1<NonNullable<Exclude<T, void>>> = noop): CbErrorObj1<HandledError | null, T | null | void> {
    return function errorHandler(err: HandledError | null, arg1: T | null | void) {
        if (err) {
            respondError(options)(err);
            return;
        }
        if (!arg1) {
            if (options && hasRes(options)) {
                options.res.status(options.statusCode || 404).send('Resource Not Found');
            }
            return;
        }
        cb(arg1 as NonNullable<Exclude<T, void>>);
    };
}

export function respondError(options?: HandlerOptionsNoRes): (err: HandledError) => void;
export function respondError(options: HandlerOptionsRes): (err: HandledError) => Response;
export function respondError(options: HandlerOptions): (err: HandledError) => Response | void;
export function respondError<T>(options?: T extends Error ? never : HandlerOptions): (err: HandledError) => void | Response  {
    const handler = (err: HandledError) => {
        if (!options) {
            options = {} as T extends Error ? never : HandlerOptions;
        }
        let sent;
        if (hasRes(options)) {
            if (err.name === 'CastError' && (err as CastError).kind === 'ObjectId') {
                return options.res.status(400).send('Invalid id');
            }
            if (err.message === 'validation failed' && Array.isArray((err as any).errors) && (err as any).errors[0].message) {
                // JSON Schema validation
                return options.res.status(400).send((err as any).errors[0].message)
            }
            if (err.name === 'ValidationError') {
                return options.res.status(422).send(err.message);
            }
            const message = options.publicMessage || 'Generic Server Failure. Please submit an issue.';
            sent = options.res.status(500).send('Error: ' + message);
        }

        logError({
            details: options.details,
            message: options.message || err.message || (err as any),
            origin: options.origin || 'request processing',
            publicMessage: options.publicMessage,
            request: options.req
                ? {
                    url: options.req.url,
                    params: JSON.stringify(options.req.params),
                    body: JSON.stringify(options.req.body),
                    username: (options.req as AuthenticatedRequest).username,
                    ip: options.req.ip,
                }
                : undefined,
            stack: err.stack || new Error().stack,
        });
        return sent;
    };
    if (options instanceof Error) {
        return handler(options) as any;
    }
    return handler;
}

export function respondPromise<T>(options: HandlerOptionsRes, promise: Promise<T>): Promise<Response> {
    return promise.then(
        t => options.res.send(t),
        err => {
            if (typeof err === 'string') {
                return options.res.status(400).send(err);
            }
            const handler = respondError(options) as unknown as (err: HandledError) => Response; // WORKAROUND: typescript bug
            return handler(err);
        }
    );
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
