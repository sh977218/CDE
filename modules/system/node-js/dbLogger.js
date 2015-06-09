var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , logging = require('./logging')
    ;
    
var mongoLogUri = config.database.log.uri || 'mongodb://localhost/cde-logs';
var LogModel;
var LogErrorModel;
var ClientErrorModel;
var StoredQueryModel;
var FeedbackModel;

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

var storedQuerySchema= new mongoose.Schema(
    {
        searchTerm: String
        , date: {type: Date, default: Date.now}
        , username: String
        , remoteAddr: String
        , isSiteAdmin: Boolean
        , regStatuses: [String]
        , selectedOrg1: String
        , selectedOrg2: String
        , selectedElements1: [String]
        , selectedElements2: [String]
    }, { safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024*1024*250});

var feedbackIssueSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, index: true }
    , user: {
        username: String
        , ip: String
    }
    , screenshot: {
        id: String
        , content: String
    }
    , rawHtml: String
    , userMessage: String
    , browswer: String
    , reportedUrl: String
});

var connectionEstablisher = connHelper.connectionEstablisher;

var iConnectionEstablisherLog = new connectionEstablisher(mongoLogUri, 'Logs');
iConnectionEstablisherLog.connect(function(conn) {
    LogModel = conn.model('DbLogger', logSchema);
    LogErrorModel = conn.model('DbErrorLogger', logErrorSchema);
    ClientErrorModel = conn.model('DbClientErrorLogger', clientErrorSchema);
    StoredQueryModel = conn.model('StoredQuery', storedQuerySchema);
    FeedbackModel = conn.model('FeedbackIssue', feedbackIssueSchema);
});

exports.storeQuery = function(settings, callback) {
    var regStatuses =  [];
    if (settings.selectedStatuses) {
        settings.selectedStatuses.forEach(function (rs) {
            if (rs.selected) {
                regStatuses.push(rs.name);
            }
        });
    }
    if (regStatuses.length === 0) regStatuses = settings.visibleRegStatuses;
    var storedQuery = new StoredQueryModel ({
        searchTerm: settings.searchTerm
        , regStatuses: regStatuses
        , selectedElements1: settings.selectedElements.slice(0)
        , selectedElements2: settings.selectedElementsAlt.slice(0)
    });
    if (settings.username) storedQuery.username = settings.username;
    if (settings.remoteAddr) storedQuery.remoteAddr = settings.remoteAddr;
    if (settings.isSiteAdmin) storedQuery.isSiteAdmin = settings.isSiteAdmin;
    if (settings.selectedOrg) storedQuery.selectedOrg1 = settings.selectedOrg;
    if (settings.selectedOrgAlt) storedQuery.selectedOrg2 = settings.selectedOrgAlt;

    // @TODO add IP and username.

    storedQuery.save(function(err) {
        if (err) console.log(err);
        if (callback) callback(err);
    });

};

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
    var d = new Date();
    d.setDate(d.getDate() - 3);
    LogModel.aggregate(
        {$match: {date: {$exists: true}, date: {$gte: d}}}
        , {$group : {_id: {ip: "$remoteAddr", year: {$year: "$date"}, month: {$month: "$date"}, dayOfMonth: {$dayOfMonth: "$date"}}, number: {$sum: 1}, latest: {$max: "$date"}}}
        , function (err, result) {
            if (err || !result) logging.errorLogger.error("Error: Cannot retrieve logs", {origin: "system.dblogger.usageByDay", stack: new Error().stack, details: "err "+err});
            callback(result);
        }
    );
};

exports.saveFeedback = function(req, cb) {
    var report = JSON.parse(req.body.feedback);
    var issue = new FeedbackModel({
        user: {username: req.user?req.user.username:null}
        , rawHtml: report.html
        , reportedUrl: report.url
        , userMessage: report.note
        , screenshot: {content: report.img}
    });
    issue.save(function(err){
        if (cb) cb(err);
    });
};

