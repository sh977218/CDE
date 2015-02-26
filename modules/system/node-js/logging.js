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

//MongoErrorLogger.prototype.log = function (level, msg, meta, cb) {
//    try {
//        var message = {
//            message: msg
//            , origin: meta.origin
//            , stack: meta.stack || new Error().stack  
//            , details: meta.details            
//        };
//        if (meta.request) message.request = exports.generateErrorLogRequest(meta.request);
//        dbLogger.logError(message, function (err) {
//            if (err) console.log("CANNOT LOG: ");  
//        });
//    } catch (e) {
//        console.log("unable to log error to DB: ");
//    }
//};

MongoErrorLogger.prototype.log = function (level, msg, meta, cb) {
    processDetails = function(details){
        if (typeof details === "string") return details;
        if (typeof details !== "object") return "Error in logger: Cannot process details.";
        Object.keys(details).map(function(name){
            var value = details[name];
            if (typeof value === "string") return name + "=" + value;
            else if (typeof value === "object" && typeof value.toString === "function") return name + "=" + value.toString();
            else if (typeof value === "object" && typeof value.name !== "undefined") return name + "=" + value.name;
            else {
                try {
                    var valueStr = JSON.stringify(value);
                    return name + "=" + valueStr;
                } catch(e){
                    return "Error in logger: Cannot process details.";
                }
            }
        });
        
    };
    try {
        var message = {
            message: msg
            , origin: meta.origin
            , stack: meta.stack || new Error().stack  
            , details: processDetails(meta.details)
        };
        if (meta.request) message.request = exports.generateErrorLogRequest(meta.request);
        dbLogger.logError(message, function (err) {
            if (err) console.log("CANNOT LOG: ");  
        });
    } catch (e) {
        console.log("unable to log error to DB: ");
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

exports.generateErrorLogRequest = function (req) {
    var url, method, params, body, username; 
    try {
        url = req.url;
        method = req.method;
        body = JSON.stringify(req.body);
        if (req.user) username = req.user.username;
    } catch (e){
        
    }
    return {
        url: url
        , method: method
        , params: params
        , body: body
        , username: username
    };
};
