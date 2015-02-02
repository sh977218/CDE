var mongoose = require('mongoose')
    , config = require('config')
    , connHelper = require('./connections')
    ;
    
var mongoLogUri = config.database.log.uri || 'mongodb://localhost/cde-logs';
var LogModel;
var LogErrorModel;

// w = 0 means write very fast. It's ok if it fails.   
// capped means no more than 5 gb for that collection.
var logSchema = new mongoose.Schema(
{
    level: String
    , remoteAddr: String
    , url: String
    , method: String
    , httpStatus: String
    , date: Date
    , referrer: String
}, { safe: {w: 0}, capped: 5368709120});
logSchema.index({remoteAddr: 1});
logSchema.index({url: 1});
logSchema.index({httpStatus: 1});
logSchema.index({date: 1});
logSchema.index({referrer: 1});

var logErrorSchema = new mongoose.Schema(
{
    stack: String
    , date: Date
}, { safe: {w: 0}, capped: 5368709120});

var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherLog = new connectionEstablisher(mongoLogUri, 'Logs');
iConnectionEstablisherLog.connect(function(conn) {
    LogModel = conn.model('DbLogger', logSchema);
    LogErrorModel = conn.model('DbErrorLogger', logErrorSchema);
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
    var logEvent = new LogErrorModel({stack: message, date: new Date()});
    logEvent.save(function(err) {
        if (err) console.log ("ERROR: " + err);
        callback(err); 
    });
};

exports.getLogs = function(inQuery, callback) {
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
    
    query.sort("-date").limit(10000).exec(function(err, logs) {
        callback(err, logs);  
    });
};

exports.usageByDay = function(callback) {
    LogModel.aggregate(
        {$match: {date: {$exists: true}}}
        , {$group : {_id: {ip: "$remoteAddr", year: {$year: "$date"}, month: {$month: "$date"}, dayOfMonth: {$dayOfMonth: "$date"}}, number: {$sum: 1}}}
        , function (err, result) {
            callback(result);
        }
    );
};


