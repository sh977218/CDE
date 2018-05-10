const config = require('./parseConfig');
const connHelper = require('./connections');
const logging = require('./logging');
const mongo_data_system = require('./mongo-data');
const mongo_storedQuery = require('../cde/mongo-storedQuery');
const email = require('./email');
const schemas_system = require('./schemas');
const moment = require('moment');
const noDbLogger = require('./noDbLogger');
const pushNotification = require('./pushNotification');

const conn = connHelper.establishConnection(config.database.log);

const LogModel = conn.model('DbLogger', schemas_system.logSchema);
const LogErrorModel = conn.model('DbErrorLogger', schemas_system.logErrorSchema);
const ClientErrorModel = conn.model('DbClientErrorLogger', schemas_system.clientErrorSchema);
const StoredQueryModel = mongo_storedQuery.StoredQueryModel;
const FeedbackModel = conn.model('FeedbackIssue', schemas_system.feedbackIssueSchema);
const consoleLogModel = conn.model('consoleLogs', schemas_system.consoleLogSchema);
const TrafficFilterModel = conn.model('trafficFilter', schemas_system.trafficFilterSchema);

let initTrafficFilter = cb => {
    TrafficFilterModel.remove({}).exec(() => {
       new TrafficFilterModel({ipList: []}).save(cb);
    });
};
exports.getTrafficFilter = function (cb) {
    TrafficFilterModel.findOne({}).exec((err, theOne) => {
       if (err || !theOne) initTrafficFilter((err2, newOne) => cb(newOne));
       else cb(theOne);
    });
};
exports.banIp = function (ip, reason) {
    TrafficFilterModel.findOne({}).exec((err, theOne) => {
      if (err) {
          exports.logError({
              message: "Unable ban IP ",
              origin: "dbLogger.banIp",
              stack: err,
              details: ""
          });
      } else {
        let foundIndex = theOne.ipList.findIndex(r => r.ip === ip);
        if (foundIndex > -1) {
            theOne.ipList[foundIndex].strikes++;
            theOne.ipList[foundIndex].reason = reason;
            theOne.ipList[foundIndex].date = Date.now();
        } else {
            theOne.ipList.push({ip: ip, reason: reason});
        }
        theOne.save();
      }
    });
};

exports.consoleLog = function (message, level) { // no express errors see dbLogger.log(message)
    new consoleLogModel({
        message: message, level: level
    }).save(err => {
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
    new LogErrorModel(message).save(err => {
        if (err) noDbLogger.noDbLogger.info("ERROR: ");
        let msg = {
            title: 'Server Side Error',
            options: {
                body: ("Server Side Error: " + message.message.substr(0, 30)),
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

        mongo_data_system.pushGetAdministratorRegistrations((err, registrations) => {
            if (err) {
                return; // no log to prevent re-trigger
            }
            registrations.forEach(r => pushNotification.triggerPushMsg(r, JSON.stringify(msg)));
        });
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
                body: ("Client Side Error: " + exc.message.substr(0, 30)),
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

        mongo_data_system.pushGetAdministratorRegistrations((err, registrations) => {
            if (err) {
                return exports.logIfMongoError(err);
            }
            registrations.forEach(r => pushNotification.triggerPushMsg(r, JSON.stringify(msg)));
        });
        callback(err);
    });
};

exports.handleGenericError = function (options, cb) {
    return function errorHandler(err, ...args) {
        if (err) {
            if (options && options.res) {
                let message = options.publicMessage || "An error has occured. It's already been reported.";
                res.status(500).send(message);
            }
            exports.logError({
                message: options.message,
                origin: options.origin,
                stack: err,
                details: options.details
            });
        }
        cb(...args);
    };
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
    ClientErrorModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
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
    let report = JSON.parse(req.body.feedback);
    let issue = new FeedbackModel({
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
    let emailContent = {
        subject: "Issue reported by a user"
        , body: report.note
    };
    mongo_data_system.siteAdmins(function (err, users) {
        email.emailUsers(emailContent, users, function () {
        });
    });
};

