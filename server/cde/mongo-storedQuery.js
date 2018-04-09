var config = require('../system/parseConfig');
var elastic = require('./elastic');
var schemas_system = require('../system/schemas');
var connHelper = require('../system/connections');

exports.type = "storedQuery";
exports.name = "storedQueries";

var conn = connHelper.establishConnection(config.database.log);

var StoredQueryModel = conn.model('StoredQuery', schemas_system.storedQuerySchema);
exports.StoredQueryModel = StoredQueryModel;

exports.getStream = function (condition) {
    return StoredQueryModel.find(condition).sort({_id: -1}).cursor();
};
exports.count = function (condition, callback) {
    StoredQueryModel.count(condition).exec(function (err, count) {
        callback(err, count);
    });
};