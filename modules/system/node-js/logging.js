var winston = require('winston')
  , util = require('util')
  , dbLogger = require('./dbLogger.js')
  , helper = require('./helper.js')
;

var MongoLogger = winston.transports.MongoLogger = function (options) {
    this.name = 'mongoLogger';
    this.json = true;
    this.level = options.level || 'info';
};

util.inherits(MongoLogger, winston.Transport);

MongoLogger.prototype.log = function (level, msg, meta, callback) {
    console.log(msg);
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

exports.expressLogger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      json: true,
      colorize: true
      , level: 'verbose'
      , filename: helper.GLOBALS.logdir + "/expressLog.log"
      , maxsize: 10000000
      , maxFiles: 10
    })
    , new winston.transports.Console(
        {
            level: 'verbose',
            colorize: true,
            timestamp: true
        }) 
    , new winston.transports.MongoLogger({
        json: true
    })  ]
});

exports.expressErrorLogger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      json: true,
      colorize: true
      , level: 'warn'
      , filename: helper.GLOBALS.logdir + "/expressErrorLog.log"
      , maxsize: 10000000
      , maxFiles: 10
    })
    , new winston.transports.MongoLogger({
        json: true
    })
  ]
});

exports.processLogger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      json: true,
      colorize: true
      , level: 'error'
      , filename: helper.GLOBALS.logdir + "/nodeErrorLog.log"
      , maxsize: 10000000
      , maxFiles: 10
    })
  ]
});