var config = require('../../system/node-js/parseConfig');
var elastic = require('./elastic');
var schemas_system = require('../../system/node-js/schemas');
var connHelper = require('../../system/node-js/connections');

exports.type = "storedquery";
exports.name = "storedqueries";

var conn = connHelper.establishConnection(config.database.log);
var StoredQueryModel = conn.model('StoredQuery', schemas_system.storedQuerySchema);

schemas_system.storedQuerySchema.pre('save', function (next) {
    var self = this;
    elastic.storedQueryUpdateOrInsert(this);
    next();
});

schemas_system.storedQuerySchema.pre('update', function (next) {
    var self = this;
    elastic.storedQueryUpdateOrInsert(this);
    next();
});

schemas_system.storedQuerySchema.pre('remove', function (next) {
    var self = this;
    elastic.storedQueryDelete(self);
    next();
});

exports.getStream = function (condition) {
    return StoredQueryModel.find(condition).sort({_id: -1}).stream();
};
exports.count = function (condition, callback) {
    StoredQueryModel.count(condition).exec(function (err, count) {
        callback(err, count);
    });
};