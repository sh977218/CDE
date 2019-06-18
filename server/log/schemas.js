const config = require('../system/parseConfig');
const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = mongoose.Schema.Types.StringType;

let schemas = {};

const cappedSize = config.database.log.cappedCollectionSizeMB;

schemas.consoleLogSchema = new Schema({ // everything server except express
    date: {type: Date, index: true, default: Date.now()},
    message: StringType,
    level: {type: StringType, enum: ['debug', 'info', 'warning', 'error'], default: 'info'},
}, {w: 0, capped: cappedSize});

schemas.logSchema = new Schema({ // express
    level: StringType,
    remoteAddr: {type: StringType, index: true},
    url: StringType,
    method: StringType,
    httpStatus: StringType,
    date: {type: Date, index: true},
    referrer: StringType,
    responseTime: {type: Number, index: true}
}, {w: 0, capped: cappedSize});

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
}, {w: 0, capped: cappedSize});

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
}, {w: 0, capped: cappedSize});

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
}, {w: 0});

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