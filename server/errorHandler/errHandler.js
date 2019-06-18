const _ = require('lodash');
const dbLogger = require("../log/dbLogger");
const noDbLogger = require('../system/noDbLogger');

exports.handleConsoleError = function (options, cb = _.noop) {
    return function errorHandler(err, ...args) {
        if (err) noDbLogger.noDbLogger.info('ERROR: ' + err);
        cb(...args);
    }
};

exports.handleError = function (options, cb = _.noop) {
    return function errorHandler(err, ...args) {
        if (err) {
            exports.respondError(err, options);
            return;
        }
        cb(...args);
    };
};

exports.handle404 = function handle404(options, cb) { // Not Found
    return function errorHandler(err, arg, ...args) {
        if (err) {
            exports.respondError(err, options);
            return;
        }
        if (!arg) {
            if (options && options.res) {
                options.res.status(404).send();
            }
            return;
        }
        cb(arg, ...args);
    };
};



// TODO: Combine with logError() which publishes notifications
// TODO: tee to console.log
exports.respondError = function (err, options) {
    if (!options) options = {};
    if (options.res) {
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            options.res.status(400).send('Invalid id');
            return;
        } else if (err.name === 'ValidationError') {
            options.res.status(422).send(err.message);
            return;
        }
        let message = options.publicMessage || 'Generic Server Failure. Please submit an issue.';
        options.res.status(500).send('Error: ' + message);
    }

    const log = {
        message: options.message || err.message || err,
        origin: options.origin,
        stack: err.stack || new Error().stack,
        details: options.details
    };
    if (options.req) {
        log.request = {
            url: options.req.url,
            params: JSON.stringify(options.req.params),
            body: JSON.stringify(options.req.body),
            username: options.req.username,
            ip: options.req.ip
        };
    }
    dbLogger.logError(log);
};
