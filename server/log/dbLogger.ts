import { handleConsoleError, handleError } from '../errorHandler/errHandler';
import { config } from '../system/parseConfig';

const connHelper = require('../system/connections');
const mongo_data = require('../system/mongo-data');
const mongo_storedQuery = require('../cde/mongo-storedQuery');
const schemas = require('./schemas');
const moment = require('moment');
const noDbLogger = require('../system/noDbLogger');
const pushNotification = require('../system/pushNotification');
const conn = connHelper.establishConnection(config.database.log);
const LogModel = conn.model('DbLogger', schemas.logSchema);
export const LogErrorModel = conn.model('DbErrorLogger', schemas.logErrorSchema);
export const ClientErrorModel = conn.model('DbClientErrorLogger', schemas.clientErrorSchema);
export const StoredQueryModel = mongo_storedQuery.StoredQueryModel;
const FeedbackModel = conn.model('FeedbackIssue', schemas.feedbackIssueSchema);
const consoleLogModel = conn.model('consoleLogs', schemas.consoleLogSchema);
const userAgent = require('useragent');

export function consoleLog(message, level = 'debug') { // no express errors see dbLogger.log(message)
    new consoleLogModel({message: message, level: level}).save(err => {
        if (err) noDbLogger.noDbLogger.error('Cannot log to DB: ' + err);
    });
}

export function storeQuery(settings, callback) {
    const storedQuery: any = {
        searchTerm: settings.searchTerm ? settings.searchTerm : ''
        , date: new Date()
        , regStatuses: settings.selectedStatuses
        , datatypes: settings.selectedDatatypes
        , selectedElements1: settings.selectedElements.slice(0)
        , selectedElements2: settings.selectedElementsAlt.slice(0)
    };
    if (settings.selectedOrg) storedQuery.selectedOrg1 = settings.selectedOrg;
    if (settings.selectedOrgAlt) storedQuery.selectedOrg2 = settings.selectedOrgAlt;
    if (settings.searchToken) storedQuery.searchToken = settings.searchToken;

    if (!(!storedQuery.selectedOrg1 && storedQuery.searchTerm === '')) {
        StoredQueryModel.findOne({date: {$gt: new Date().getTime() - 30000}, searchToken: storedQuery.searchToken},
            (err, theOne) => {
                if (theOne) {
                    StoredQueryModel.findOneAndUpdate(
                        {date: {$gt: new Date().getTime() - 30000}, searchToken: storedQuery.searchToken},
                        storedQuery,
                        handleError({}, () => {})
                    );
                } else {
                    new StoredQueryModel(storedQuery).save(callback);
                }
            });
    }
}

export function log(message, callback) { // express only, all others dbLogger.consoleLog(message);
    if (isNaN(message.responseTime)) delete message.responseTime;

    if (message.httpStatus !== '304') {
        new LogModel(message).save(err => {
            if (err) noDbLogger.noDbLogger.info('ERROR: ' + err);
            callback(err);
        });
    }
}

export function logError(message, callback) { // all server errors, express and not
    message.date = new Date();
    if (typeof message.stack === 'string') message.stack = message.stack.substr(0, 1000);
    let description = (message.message || message.publicMessage || '').substr(0, 30);
    if (config.logToConsoleForServerError) {
        console.log('---Server Error---');
        console.log(message);
        console.log('--- END Server Error---');
    }
    new LogErrorModel(message).save(handleConsoleError({}, () => {
        if (message.origin && message.origin.indexOf('pushGetAdministratorRegistrations') === -1) {
            let msg = JSON.stringify({
                title: 'Server Side Error',
                options: {
                    body: description,
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
            });
            mongo_data.pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => pushNotification.triggerPushMsg(r, msg));
            });
        }
        if (callback) callback();
    }));
}

export function logClientError(req, callback) {
    let getRealIp =  req => req._remoteAddress;
    let exc = req.body;
    exc.userAgent = req.headers['user-agent'];
    exc.date = new Date();
    exc.ip = getRealIp(req);
    if (req.user) exc.username = req.user.username;
    new ClientErrorModel(exc).save(handleConsoleError({}, () => {
        let ua = userAgent.is(req.headers['user-agent']);
        if (ua.chrome || ua.firefox || ua.edge) {
            let msg = JSON.stringify({
                title: 'Client Side Error',
                options: {
                    body: (exc.message || '').substr(0, 30),
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
            });
            mongo_data.pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => pushNotification.triggerPushMsg(r, msg));
            });
        }

        callback();
    }));
}

export function httpLogs(body, callback) {
    let sort = {date: 'desc'};
    if (body.sort) sort = body.sort;
    let currentPage = 0;
    if (body.currentPage) currentPage = Number.parseInt(body.currentPage);
    let itemsPerPage = 200;
    let skip = currentPage * itemsPerPage;
    let query = {};
    if (body.ipAddress) query = {remoteAddr: body.ipAddress};
    let modal = LogModel.find(query);
    if (body.fromDate) modal.where('date').gte(moment(body.fromDate));
    if (body.toDate) modal.where('date').lte(moment(body.toDate));
    LogModel.countDocuments({}, (err, count) => {
        modal.sort(sort).limit(itemsPerPage).skip(skip).exec((err, logs) => {
            let result: any = {logs: logs, sort: sort};
            if (!body.totalItems) result.totalItems = count;
            callback(err, result);
        });
    });
}

export function appLogs(body, callback) {
    let currentPage = 0;
    if (body.currentPage) currentPage = Number.parseInt(body.currentPage);
    let itemsPerPage = 50;
    let skip = currentPage * itemsPerPage;
    let modal = consoleLogModel.find();
    if (body.fromDate) modal.where('date').gte(moment(body.fromDate));
    if (body.toDate) modal.where('date').lte(moment(body.toDate));
    consoleLogModel.countDocuments({}, (err, count) => {
        modal.sort({date: -1}).limit(itemsPerPage).skip(skip).exec(function (err, logs) {
            let result: any = {logs: logs};
            result.totalItems = count;
            callback(err, result);
        });
    });
}

export function getServerErrors(params, callback) {
    if (!params.limit) params.limit = 20;
    if (!params.skip) params.skip = 0;
    const filter: any = {};
    if (params.excludeOrigin && params.excludeOrigin.length > 0) {
        filter.origin = {$nin: params.excludeOrigin};
    }
    LogErrorModel
        .find(filter)
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
}

export function getClientErrors(params, callback) {
    ClientErrorModel.find().sort('-date').skip(params.skip).limit(params.limit).exec(callback);
}

export function getFeedbackIssues(params, callback) {
    FeedbackModel
        .find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(callback);
}

export function usageByDay(callback) {
    let d = new Date();
    d.setDate(d.getDate() - 3);
    //noinspection JSDuplicatedDeclaration
    LogModel.aggregate([
        // @ts-ignore
        {$match: {date: {$exists: true}, date: {$gte: d}}},
        {
            $group: {
                _id: {
                    ip: '$remoteAddr',
                    year: {$year: '$date'},
                    month: {$month: '$date'},
                    dayOfMonth: {$dayOfMonth: '$date'}
                }, number: {$sum: 1}, latest: {$max: '$date'}
            }
        }], callback);
}

export function saveFeedback(req, cb) {
    let report = JSON.parse(req.body.feedback);
    let issue = new FeedbackModel({
        user: {username: req.user && req.user._doc ? req.user._doc.username : null}
        , rawHtml: report.html
        , reportedUrl: report.url
        , userMessage: report.note
        , screenshot: {content: report.img}
        , browser: report.browser.userAgent
    });
    issue.save(cb);
}
