const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const mongo_data = require('../system/mongo-data');
const mongo_storedQuery = require('../cde/mongo-storedQuery');
const schemas = require('./schemas');
const moment = require('moment');
const noDbLogger = require('../system/noDbLogger');
const pushNotification = require('../system/pushNotification');

const conn = connHelper.establishConnection(config.database.log);

const LogModel = conn.model('DbLogger', schemas.logSchema);
const LogErrorModel = conn.model('DbErrorLogger', schemas.logErrorSchema);
const ClientErrorModel = conn.model('DbClientErrorLogger', schemas.clientErrorSchema);
const StoredQueryModel = mongo_storedQuery.StoredQueryModel;
const FeedbackModel = conn.model('FeedbackIssue', schemas.feedbackIssueSchema);
const consoleLogModel = conn.model('consoleLogs', schemas.consoleLogSchema);

exports.consoleLog = function (message, level) { // no express errors see dbLogger.log(message)
    new consoleLogModel({message: message, level: level}).save(err => {
        if (err) noDbLogger.noDbLogger.error("Cannot log to DB: " + err);
    });
};

exports.storeQuery = function (settings, callback) {
    const storedQuery = {
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
                        err => {
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

exports.log = function (message, callback) { // express only, all others dbLogger.consoleLog(message);
    if (isNaN(message.responseTime)) delete message.responseTime;

    if (message.httpStatus !== "304") {
        new LogModel(message).save(err => {
            if (err) noDbLogger.noDbLogger.info("ERROR: " + err);
            callback(err);
        });
    }
};

exports.logError = function (message, callback) { // all server errors, express and not
    message.date = new Date();
    let description = (message.message || message.publicMessage || '').substr(0, 30);

    mongo_data.saveNotification({
        title: "Server Side Error: " + description,
        url: "/siteAudit#serverError",
        roles: ['siteAdmin']
    });

    new LogErrorModel(message).save(err => {
        if (err) noDbLogger.noDbLogger.info("ERROR: ");
        let msg = {
            title: 'Server Side Error',
            options: {
                body: "Server Side Error: " + description,
                icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
                badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
                tag: 'cde-server-side',
                actions: [
                    {
                        action: 'audit-action',
                        title: 'View',
                        icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
                    }
                ]
            }
        };

        if (message.origin && message.origin.indexOf("pushGetAdministratorRegistrations") === -1) {
            mongo_data.pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => pushNotification.triggerPushMsg(r, JSON.stringify(msg)));
            });
        }
        if (callback) callback(err);
    });
};

exports.logClientError = function (req, callback) {
    let getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };
    let exc = req.body;
    exc.userAgent = req.headers['user-agent'];
    exc.date = new Date();
    exc.ip = getRealIp(req);
    if (req.user) exc.username = req.user.username;
    new ClientErrorModel(exc).save(err => {
        if (err) noDbLogger.noDbLogger.info("ERROR: " + err);
        let msg = {
            title: 'Client Side Error',
            options: {
                body: "Client Side Error: " + exc.message.substr(0, 30),
                icon: '/cde/public/assets/img/NIH-CDE-FHIR.png',
                badge: '/cde/public/assets/img/nih-cde-logo-simple.png',
                tag: 'cde-client-side',
                actions: [
                    {
                        action: 'audit-action',
                        title: 'View',
                        icon: '/cde/public/assets/img/nih-cde-logo-simple.png'
                    }
                ]
            }
        };

        mongo_data.saveNotification({
            title: "Client Side Error: " + exc.message.substr(0, 30),
            url: "/siteAudit#clientErrors",
            roles: ['siteAdmin']
        });

        mongo_data.pushGetAdministratorRegistrations(registrations => {
            registrations.forEach(r => pushNotification.triggerPushMsg(r, JSON.stringify(msg)));
        });
        callback(err);
    });
};

// @TODO: remove most "res.status(500)" from the system
exports.handleError = function (options, cb) {
    return function errorHandler(err, ...args) {
        if (err) {
            exports.respondError(err, options);
        }
        cb(...args);
    };
};

// @TODO: Combine with logError() which publishes notifications
exports.respondError = function(err, options) {
    if (options && options.res) {
        let message = options.publicMessage || "Generic Server Failure. Please submit an issue.";
        options.res.status(500).send('Error: ' + message);
    }
    exports.logError({
        message: options.message || err.message,
        origin: options.origin,
        stack: err.stack,
        details: options.details
    });
};

exports.httpLogs = function (body, callback) {
    let sort = {"date": "desc"};
    if (body.sort) sort = body.sort;
    let currentPage = 1;
    if (body.currentPage) currentPage = Number.parseInt(body.currentPage);
    let itemsPerPage = 500;
    if (body.itemsPerPage) itemsPerPage = Number.parseInt(body.itemsPerPage);
    let skip = (currentPage - 1) * itemsPerPage;
    let query = {};
    if (body.ip) query = {ip: body.ipAddress};
    let modal = LogModel.find(query);
    if (body.fromDate) modal.where("date").gte(moment(body.fromDate));
    if (body.toDate) modal.where("date").lte(moment(body.toDate));
    LogModel.count({}, (err, count) => {
        modal.sort(sort).limit(itemsPerPage).skip(skip).exec((err, logs) => {
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
    const filter = {};
    if (params.excludeOrigin && params.excludeOrigin.length > 0) {
        filter.origin = {$nin: params.excludeOrigin};
    }
    LogErrorModel
        .find(filter)
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
};

exports.getClientErrors = function (params, callback) {
    ClientErrorModel.find().sort('-date').skip(params.skip).limit(params.limit).exec(callback);
};

exports.getFeedbackIssues = function (params, callback) {
    FeedbackModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
};

exports.usageByDay = function (callback) {
    let d = new Date();
    d.setDate(d.getDate() - 3);
    //noinspection JSDuplicatedDeclaration
    LogModel.aggregate([
        {$match: {date: {$exists: true}, date: {$gte: d}}},
        {
            $group: {
                _id: {
                    ip: "$remoteAddr",
                    year: {$year: "$date"},
                    month: {$month: "$date"},
                    dayOfMonth: {$dayOfMonth: "$date"}
                }, number: {$sum: 1}, latest: {$max: "$date"}
            }
        }], callback);
};

exports.saveFeedback = function (req, cb) {
    let report = JSON.parse(req.body.feedback);
    let issue = new FeedbackModel({
        user: {username: req.user && req.user._doc ? req.user._doc.username : null}
        , rawHtml: report.html
        , reportedUrl: report.url
        , userMessage: report.note
        , screenshot: {content: report.img}
        , browser: report.browser.userAgent
    });
    issue.save(err => {
        if (cb) cb(err);
    });
};

