var config = require('../../system/node-js/parseConfig');
var schemas = require('./schemas');
var schemas_system = require('../../system/node-js/schemas');
var mongo_data_system = require('../../system/node-js/mongo-data');
var connHelper = require('../../system/node-js/connections');
var logging = require('../../system/node-js/logging');
var adminItemSvc = require('../../system/node-js/adminItemSvc.js');
var cdesvc = require("./cdesvc");
var async = require('async');
var CronJob = require('cron').CronJob;
var elastic = require('./elastic');

exports.type = "board";
exports.name = "boards";

var conn = connHelper.establishConnection(config.database.appData);
var PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);

exports.getStream = function (condition) {
    return PinningBoard.find(condition).sort({_id: -1}).stream();
};

exports.count = function (condition, callback) {
    PinningBoard.count(condition).exec(function (err, count) {
        callback(err, count);
    });
};