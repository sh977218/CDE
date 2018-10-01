const config = require('config');
const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = mongoose.Schema.Types.StringType;

let schemas = {};

schemas.consoleLogSchema = new Schema({ // everything server except express
    date: {type: Date, index: true, default: Date.now()},
    message: StringType,
    level: {type: StringType, enum: ['debug', 'info', 'warning', 'error'], default: 'info'},
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logSchema = new Schema({ // express
    level: StringType,
    remoteAddr: {type: StringType, index: true},
    url: StringType,
    method: StringType,
    httpStatus: StringType,
    date: {type: Date, index: true},
    referrer: StringType,
    responseTime: {type: Number, index: true}
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.logErrorSchema = new Schema({ // server
    message: StringType,
    date: {type: Date, index: true},
    details: StringType,
    origin: StringType,
    stack: StringType,
    request: {
        url: StringType,
        method: StringType,
        params: StringType,
        body: StringType,
        username: StringType,
        userAgent: StringType,
        ip: StringType
    }
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.clientErrorSchema = new Schema({
    message: StringType,
    date: {type: Date, index: true},
    origin: StringType,
    name: StringType,
    stack: StringType,
    userAgent: StringType,
    url: StringType,
    username: StringType,
    ip: StringType
}, {safe: {w: 0}, capped: config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250});

schemas.storedQuerySchema = new Schema({
    searchTerm: {type: StringType, lowercase: true, trim: true},
    date: {type: Date, default: Date.now},
    searchToken: StringType,
    username: StringType,
    remoteAddr: StringType,
    isSiteAdmin: Boolean,
    regStatuses: [StringType],
    selectedOrg1: StringType,
    selectedOrg2: StringType,
    selectedElements1: [StringType],
    selectedElements2: [StringType]
}, {safe: {w: 0}});

schemas.feedbackIssueSchema = new Schema({
    date: {type: Date, default: Date.now, index: true},
    user: {
        username: StringType,
        ip: StringType
    },
    screenshot: {
        id: StringType,
        content: StringType
    },
    rawHtml: StringType,
    userMessage: StringType,
    browser: StringType,
    reportedUrl: StringType
});

module.exports = schemas;