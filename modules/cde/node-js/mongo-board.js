var config = require('../../system/node-js/parseConfig');
var schemas = require('./schemas');
var connHelper = require('../../system/node-js/connections');

exports.type = "board";
exports.name = "boards";

var conn = connHelper.establishConnection(config.database.appData);
var PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);

exports.getStream = function (condition) {
    return PinningBoard.find(condition).sort({_id: -1}).stream();
};

exports.count = function (condition, callback) {
    PinningBoard.count(condition).exec(callback);
};