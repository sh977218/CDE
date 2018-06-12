const mongoose = require('mongoose');
const config = require('../system/parseConfig');

let schemas = {};

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = schemas.stringType = {type: String, set: deleteEmpty};
const stringIndexType = schemas.stringIndexType = Object.assign({index: true}, stringType);

schemas.consoleLogSchema = new mongoose.Schema({ // everything server except express
    date: {type: Date, index: true, default: Date.now()},
    message: stringType,
    level: Object.assign({enum: ['debug', 'info', 'warning', 'error'], default: 'info'}, stringType)
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logSchema = new mongoose.Schema({ // express
    level: stringType,
    remoteAddr: stringIndexType,
    url: stringType,
    method: stringType,
    httpStatus: stringType,
    date: {type: Date, index: true},
    referrer: stringType,
    responseTime: {type: Number, index: true}
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logErrorSchema = new mongoose.Schema({ // everything server and express
    message: stringType,
    date: {type: Date, index: true},
    details: stringType,
    origin: stringType,
    stack: stringType,
    request: {
        url: stringType,
        method: stringType,
        params: stringType,
        body: stringType,
        username: stringType,
        userAgent: stringType,
        ip: stringType
    }
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.clientErrorSchema = new mongoose.Schema({
    message: stringType,
    date: {type: Date, index: true},
    origin: stringType,
    name: stringType,
    stack: stringType,
    userAgent: stringType,
    url: stringType,
    username: stringType,
    ip: stringType
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.storedQuerySchema = new mongoose.Schema({
    searchTerm: Object.assign({lowercase: true, trim: true}, stringType),
    date: {type: Date, default: Date.now},
    searchToken: stringType,
    username: stringType,
    remoteAddr: stringType,
    isSiteAdmin: Boolean,
    regStatuses: [stringType],
    selectedOrg1: stringType,
    selectedOrg2: stringType,
    selectedElements1: [stringType],
    selectedElements2: [stringType]
}, {safe: {w: 0}});

schemas.feedbackIssueSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now, index: true},
    user: {
        username: stringType,
        ip: stringType
    },
    screenshot: {
        id: stringType,
        content: stringType
    },
    rawHtml: stringType,
    userMessage: stringType,
    browser: stringType,
    reportedUrl: stringType
});

schemas.trafficFilterSchema = new mongoose.Schema({
    ipList: [{
        ip: String,
        date: {type: Date, default: Date.now()},
        reason: String,
        strikes: {type: Number, default: 1},
        _id: false
    }]
});

module.exports = schemas;