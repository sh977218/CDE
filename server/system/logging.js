const winston = require('winston');
const util = require('util');
const dbLogger = require('../log/dbLogger.js');
const config = require('./parseConfig');
const noDbLogger = require('./noDbLogger');

var MongoLogger = winston.transports.MongoLogger = function (options) {
    this.name = 'mongoLogger';
    this.json = true;
    this.level = options.level || 'info';
};

var MongoErrorLogger = winston.transports.MongoErrorLogger = function (options) {
    this.name = 'mongoErrorLogger';
    this.json = true;
    this.level = options.level || 'error';
};

util.inherits(MongoLogger, winston.Transport);
util.inherits(MongoErrorLogger, winston.Transport);

MongoLogger.prototype.log = function (level, msg, meta, callback) {
    try {
        var logEvent = JSON.parse(msg);
        logEvent.level = level;
        dbLogger.log(logEvent, function (err) {
            if (err) noDbLogger.noDbLogger.error('Cannot log to DB: ' + err);
            callback(null, true);
        });
    } catch (e) {
        noDbLogger.noDbLogger.error('Cannot log to DB: ' + e);
    }
};

exports.MongoLogger = MongoLogger;

MongoErrorLogger.prototype.log = function (level, msg, meta) {
    if (!meta) meta = {};
    function processDetails(details) {
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
            let value = details[name];
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
        let message = {
            message: msg,
            origin: meta.origin,
            stack: meta.stack || new Error().stack,
            details: processDetails(meta.details),
        };
        if (meta.request) message.request = exports.generateErrorLogRequest(meta.request);
        dbLogger.logError(message, err => {
            if (err) noDbLogger.noDbLogger.error('Cannot log to DB: ' + msg);
        });
    } catch (e) {
        noDbLogger.noDbLogger.error('Cannot log to DB: ' + e);
    }
};

exports.MongoErrorLogger = MongoErrorLogger;

let expressLoggerCnf = {
  transports: [ new winston.transports.MongoLogger({
      json: true
  })]
};


var expressErrorLoggerCnf = {
  transports: [
    new winston.transports.MongoErrorLogger({
        json: true
    })
  ]
};


if (config.expressToStdout) {
    let consoleLogCnf = {
        level: 'verbose',
        colorize: true,
        timestamp: true
    };
    expressLoggerCnf.transports.push(new winston.transports.Console(consoleLogCnf));
    expressErrorLoggerCnf.transports.push(new winston.transports.Console(consoleLogCnf));
}

exports.expressLogger = new (winston.Logger)(expressLoggerCnf);
exports.errorLogger = new (winston.Logger)(expressErrorLoggerCnf);

exports.generateErrorLogRequest = function (req) {
    var url, method, body, username;
    try {
        url = req.url;
        method = req.method;
        body = JSON.stringify(req.body);
        if (req.user) username = req.user.username;
    } catch (e) {}
    return {
        url: url
        , method: method
        , body: body
        , username: username
        , userAgent: req.headers['user-agent']
        , ip: req.ip
    };
};
