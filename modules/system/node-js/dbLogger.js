var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , logging = require('./logging')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , mongo_storedQuery = require('../../cde/node-js/mongo-storedQuery')
    , email = require('../../system/node-js/email')
    , schemas_system = require('../../system/node-js/schemas')
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    ;

var esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});
var conn = connHelper.establishConnection(config.database.log);

var LogModel = conn.model('DbLogger', schemas_system.logSchema);
var LogErrorModel = conn.model('DbErrorLogger', schemas_system.logErrorSchema);
var ClientErrorModel = conn.model('DbClientErrorLogger', schemas_system.clientErrorSchema);
var StoredQueryModel = mongo_storedQuery.StoredQueryModel;
var FeedbackModel = conn.model('FeedbackIssue', schemas_system.feedbackIssueSchema);

function sqEsUpdate(elt) {
    var doc = esInit.storedQueryRiverFunction(elt.toObject());
    if (doc) {
        delete doc._id;
        esClient.index({
            index: config.elastic.storedQueryIndex.name,
            type: "storedquery",
            id: elt._id.toString(),
            body: doc
        }, function (err) {
            if (err) {
                exports.logError({
                    message: "Unable to Index document: " + doc.tinyId,
                    origin: "storedQuery.elastic.updateOrInsert",
                    stack: err,
                    details: ""
                });
            }
        });
    }
}

exports.storeQuery = function(settings, callback) {
    var storedQuery = {
        searchTerm: settings.searchTerm?settings.searchTerm:""
        , date: new Date()
        , regStatuses: settings.selectedStatuses
        , selectedElements1: settings.selectedElements.slice(0)
        , selectedElements2: settings.selectedElementsAlt.slice(0)
    };
    if (settings.username) storedQuery.username = settings.username;
    if (settings.remoteAddr) storedQuery.remoteAddr = settings.remoteAddr;
    if (settings.isSiteAdmin) storedQuery.isSiteAdmin = settings.isSiteAdmin;
    if (settings.selectedOrg) storedQuery.selectedOrg1 = settings.selectedOrg;
    if (settings.selectedOrgAlt) storedQuery.selectedOrg2 = settings.selectedOrgAlt;
    if (settings.searchToken) storedQuery.searchToken = settings.searchToken;

    if (!(!storedQuery.selectedOrg1 && storedQuery.searchTerm === "")) {
        StoredQueryModel.findOne({date: {$gt: new Date().getTime() - 30000}, searchToken: storedQuery.searchToken},
            function(err, theOne) {
                if (theOne) {
                    StoredQueryModel.findOneAndUpdate(
                            {date: {$gt: new Date().getTime() - 30000}, searchToken: storedQuery.searchToken},
                            storedQuery,
                            function (err, newObject) {
                                sqEsUpdate(newObject);
                                if (err) console.log(err);
                                if (callback) callback(err);
                            }
                        );
                } else {
                    new StoredQueryModel(storedQuery).save(callback);
                }
            });


        //
    }
};

exports.log = function(message, callback) {
    if (isNaN(message.responseTime)) {
        delete message.responseTime;
    }
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
        if (callback) callback(err);
    });
};

exports.logClientError = function(req, callback) {
    var exc = req.body;
    exc.userAgent = req.headers['user-agent'];
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
    if (!params.limit) params.limit = 20;
    if (!params.skip) params.skip = 0;
    var filter = {};
    if (params.excludeOrigin && params.excludeOrigin.length > 0) {
        filter.origin = {$nin: params.excludeOrigin};
    }
    LogErrorModel
            .find(filter)
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

exports.getFeedbackIssues = function(params, callback) {
    FeedbackModel
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
    //noinspection JSDuplicatedDeclaration
    LogModel.aggregate(
        {$match: {date: {$exists: true}, date: {$gte: d}}} // jshint ignore:line
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
        , browser: report.browser.userAgent
    });
    issue.save(function(err){
        if (cb) cb(err);
    });
    var emailContent = {
        subject: "Issue reported by a user"
        , body: report.note
    };
    mongo_data_system.siteadmins(function(err, users) {
        email.emailUsers(emailContent, users, function() {
        });
    });
};

