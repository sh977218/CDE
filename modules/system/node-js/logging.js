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

util.inherits(MongoLogger, winston.Transport);

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

var expressLoggerCnf = {
  transports: [ new winston.transports.MongoLogger({
        json: true
    })]
};

var expressErrorLoggerCnf = {
  transports: [
    new winston.transports.MongoLogger({
        json: true
    })
  ]
};

if (config.expressToStdout) {
    expressLoggerCnf.transports.push(new winston.transports.Console({
        level: 'verbose',
        colorize: true,
        timestamp: true
    }));
    expressErrorLoggerCnf.transports.push(new winston.transports.Console({
        level: 'verbose',
        colorize: true,
        timestamp: true
    }));
}
exports.expressLogger = new (winston.Logger)(expressLoggerCnf);

exports.expressErrorLogger = new (winston.Logger)(expressErrorLoggerCnf);