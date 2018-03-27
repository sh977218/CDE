var mongoose = require('mongoose')
    , config = require('./parseConfig')
    , connHelper = require('./connections')
    , logging = require('./logging')
    , mongo_data_system = require('./mongo-data')
    , mongo_storedQuery = require('../cde/mongo-storedQuery')
    , email = require('./email')
    , schemas_system = require('./schemas')
    , elasticsearch = require('elasticsearch')
    , esInit = require('./elasticSearchInit')
    , moment = require('moment')
    , noDbLogger = require('./noDbLogger')
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
var consoleLogModel = conn.model('consoleLogs', schemas_system.consoleLogSchema);

exports.consoleLog = function (message, level) {
    new consoleLogModel({
        message: message, level: level
    }).save(err => {
        if (err) noDbLogger.noDbLogger.error("Cannot log to DB: " + err);
    });
};

exports.storeQuery = function (settings, callback) {
    var storedQuery = {
        searchTerm: settings.searchTerm ? settings.searchTerm : ""
        , date: new Date()
        , regStatuses: settings.selectedStatuses
        , datatypes: settings.selectedDatatypes
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
            function (err, theOne) {
                if (theOne) {
                    StoredQueryModel.findOneAndUpdate(
                        {date: {$gt: new Date().getTime() - 30000}, searchToken: storedQuery.searchToken},
                        storedQuery,
                        function (err, newObject) {
                            if (err) noDbLogger.noDbLogger.info(err);
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

exports.log = function (message, callback) {
    if (isNaN(message.responseTime)) {
        delete message.responseTime;
    }
    if (message.httpStatus !== "304") {
        var logEvent = new LogModel(message);
        logEvent.save(function (err) {
            if (err) noDbLogger.noDbLogger.info("ERROR: " + err);
            callback(err);
        });
    }
};

exports.logError = function (message, callback) {
    message.date = new Date();
    var logEvent = new LogErrorModel(message);
    logEvent.save(function (err) {
        if (err) noDbLogger.noDbLogger.info("ERROR: ");
        if (callback) callback(err);
    });
};

exports.logClientError = function (req, callback) {
    var getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };
    var exc = req.body;
    exc.userAgent = req.headers['user-agent'];
    exc.date = new Date();
    exc.ip = getRealIp(req);
    if (req.user) exc.username = req.user.username;
    let logEvent = new ClientErrorModel(exc);
    logEvent.save(err => {
        if (err) noDbLogger.noDbLogger.info("ERROR: " + err);
        callback(err);
    });
};

exports.getLogs = function (body, callback) {
    let sort = {"date": "desc"};
    if (body.sort) sort = body.sort;
    let currentPage = 1;
    if (body.currentPage) currentPage = Number.parseInt(body.currentPage);
    let itemsPerPage = 500;
    if (body.itemsPerPage) itemsPerPage = Number.parseInt(body.itemsPerPage);
    let skip = (currentPage - 1) * itemsPerPage;
    let query = {};
    if (body.ip) query = {ip: body.ipAddress};
    let modal = LogModel.find();
    if (body.fromDate) modal.where("date").gte(moment(body.fromDate));
    if (body.toDate) modal.where("date").lte(moment(body.toDate));
    LogModel.count({}, function (err, count) {
        modal.sort(sort).limit(itemsPerPage).skip(skip).exec(function (err, logs) {
            let result = {itemsPerPage: itemsPerPage, logs: logs, sort: sort};
            if (!body.totalItems) result.totalItems = count;
            callback(err, result);
        });
    });
};

exports.appLogs = function (body, callback) {
    let currentPage = 1;
    if (body.currentPage) currentPage = Number.parseInt(body.currentPage);
    let itemsPerPage = 500;
    if (body.itemsPerPage) itemsPerPage = Number.parseInt(body.itemsPerPage);
    let skip = (currentPage - 1) * itemsPerPage;
    let query = {};
    let modal = consoleLogModel.find();
    if (body.fromDate) modal.where("date").gte(moment(body.fromDate));
    if (body.toDate) modal.where("date").lte(moment(body.toDate));
    consoleLogModel.count({}, function (err, count) {
        modal.sort({date: -1}).limit(itemsPerPage).skip(skip).exec(function (err, logs) {
            let result = {itemsPerPage: itemsPerPage, logs: logs};
            if (!body.totalItems) result.totalItems = count;
            callback(err, result);
        });
    });
};

exports.getServerErrors = function (params, callback) {
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
        .exec(function (err, logs) {
            callback(err, logs);
        });
};

exports.getClientErrors = function (params, callback) {
    ClientErrorModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(function (err, logs) {
            callback(err, logs);
        });
};

exports.getFeedbackIssues = function (params, callback) {
    FeedbackModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(function (err, logs) {
            callback(err, logs);
        });
};

exports.usageByDay = function (callback) {
    var d = new Date();
    d.setDate(d.getDate() - 3);
    //noinspection JSDuplicatedDeclaration
    LogModel.aggregate(
        {$match: {date: {$exists: true}, date: {$gte: d}}} // jshint ignore:line
        , {
            $group: {
                _id: {
                    ip: "$remoteAddr",
                    year: {$year: "$date"},
                    month: {$month: "$date"},
                    dayOfMonth: {$dayOfMonth: "$date"}
                }, number: {$sum: 1}, latest: {$max: "$date"}
            }
        }
        , function (err, result) {
            if (err || !result) logging.errorLogger.error("Error: Cannot retrieve logs", {
                origin: "system.dblogger.usageByDay",
                stack: new Error().stack,
                details: "err " + err
            });
            callback(result);
        }
    );
};

exports.saveFeedback = function (req, cb) {
    var report = JSON.parse(req.body.feedback);
    var issue = new FeedbackModel({
        user: {username: req.user && req.user._doc ? req.user._doc.username : null}
        , rawHtml: report.html
        , reportedUrl: report.url
        , userMessage: report.note
        , screenshot: {content: report.img}
        , browser: report.browser.userAgent
    });
    issue.save(function (err) {
        if (cb) cb(err);
    });
    var emailContent = {
        subject: "Issue reported by a user"
        , body: report.note
    };
    mongo_data_system.siteadmins(function (err, users) {
        email.emailUsers(emailContent, users, function () {
        });
    });
};

