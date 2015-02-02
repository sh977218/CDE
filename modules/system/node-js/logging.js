var winston = require('winston')
  , util = require('util')
  , dbLogger = require('./dbLogger.js')
  , helper = require('./helper.js')
  , config = require('config')
;

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
            if (err) console.log("CANNOT LOG: " + err);
            callback(null, true);    
        });
    } catch (e) {
        console.log("unable to log error to DB: " + msg);
    }
};
  
exports.MongoLogger = MongoLogger;

MongoErrorLogger.prototype.log = function (level, msg, meta, callback) {
    try {
        var message = {message: msg, origin: meta.origin}
        dbLogger.logError(message, function (err) {
            if (err) console.log("CANNOT LOG: " + err);
            callback(null, true);    
        });
    } catch (e) {
        console.log("unable to log error to DB: " + msg);
    }
};

exports.MongoErrorLogger = MongoErrorLogger;

var expressLoggerCnf = {
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
    var consoleLogCnf = {
        level: 'verbose',
        colorize: true,
        timestamp: true
    };
    expressLoggerCnf.transports.push(new winston.transports.Console(consoleLogCnf));
    expressErrorLoggerCnf.transports.push(new winston.transports.Console(consoleLogCnf));
}
exports.expressLogger = new (winston.Logger)(expressLoggerCnf);
exports.errorLogger = new (winston.Logger)(expressErrorLoggerCnf);
