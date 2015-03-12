var mongoose = require('mongoose')
    , config = require('config')
    , connHelper = require('./connections')
    , logging = require('./logging')
    ;
    
var mongoLogUri = config.database.log.uri || 'mongodb://localhost/cde-logs';
var LogModel;
var LogErrorModel;
var ClientErrorModel;

// w = 0 means write very fast. It's ok if it fails.   
// capped means no more than 5 gb for that collection.
var logSchema = new mongoose.Schema(
{
    level: String
    , remoteAddr: {type: String, index: true}
    , url: String
    , method: String
    , httpStatus: String
    , date: {type: Date, index: true}
    , referrer: String
}, { safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024*1024*250});

var logErrorSchema = new mongoose.Schema(
{
    message: String
    , date: {type: Date, index: true}
    , origin: String
    , stack: String
    , details: String
    , request: {
        url: String
        , method: String
        , params: String
        , body: String
        , username: String
    }
}, { safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024*1024*250});

var clientErrorSchema= new mongoose.Schema(
{
    message: String
    , date: {type: Date, index: true}
    , origin: String
    , name: String
    , stack: String
}, { safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024*1024*250});

var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherLog = new connectionEstablisher(mongoLogUri, 'Logs');
iConnectionEstablisherLog.connect(function(conn) {
    LogModel = conn.model('DbLogger', logSchema);
    LogErrorModel = conn.model('DbErrorLogger', logErrorSchema);
    ClientErrorModel = conn.model('DbClientErrorLogger', clientErrorSchema);
});

exports.log = function(message, callback) {    
    if (message.httpStatus !== "304") {
        var logEvent = new LogModel(message);
        logEvent.save(function(err) {
            if (err) console.log ("ERROR: " + err);
            callback(err); 
        });
    }
};

exports.logError = function(message, callback) {   
    message.date = new Date();
    var logEvent = new LogErrorModel(message);
    logEvent.save(function(err) {
        if (err) console.log ("ERROR: ");
        callback(err); 
    });
};

exports.logClientError = function(exc, callback) {   
    exc.date = new Date();
    var logEvent = new ClientErrorModel(exc);
    logEvent.save(function(err) {
        if (err) console.log ("ERROR: " + err);
        callback(err); 
    });
};

exports.getLogs = function(inQuery, callback) {
    var logSize = 500;
    var skip = inQuery.currentPage * logSize;
    delete inQuery.currentPage;
    var fromDate = inQuery.fromDate;
    delete inQuery.fromDate;
    var toDate = inQuery.toDate;
    delete inQuery.toDate;
    var query = LogModel.find(inQuery);
    if (fromDate !== undefined) {
        query.where("date").gte(fromDate);
    }
    if (toDate !== undefined) {
        query.where("date").lte(toDate);
    }
    LogModel.count({}, function(err, count) {
        query.sort("-date").limit(logSize).skip(skip).exec(function(err, logs) {
            callback(err, {count: count, itemsPerPage: logSize, logs: logs});  
        });        
    });
};

exports.getServerErrors = function(params, callback) {
    LogErrorModel
            .find()
            .sort('-date')
            .skip(params.skip)
            .limit(params.limit)
            .exec(function(err, logs){
        callback(err, logs);
    });
};

exports.getClientErrors = function(params, callback) {
    ClientErrorModel
            .find()
            .sort('-date')
            .skip(params.skip)
            .limit(params.limit)
            .exec(function(err, logs){
        callback(err, logs);
    });
};

exports.usageByDay = function(callback) {
    LogModel.aggregate(
        {$match: {date: {$exists: true}}}
        , {$group : {_id: {ip: "$remoteAddr", year: {$year: "$date"}, month: {$month: "$date"}, dayOfMonth: {$dayOfMonth: "$date"}}, number: {$sum: 1}, latest: {$max: "$date"}}}
        , function (err, result) {
            if (err || !result) logging.errorLogger.error("Error: Cannot retrieve logs", {origin: "system.dblogger.usageByDay", stack: new Error().stack, details: "err "+err});
            callback(result);
        }
    );
};


