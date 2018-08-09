const config = require('../system/parseConfig');
const schemas = require('../log/schemas');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.log);
const StoredQueryModel = conn.model('StoredQuery', schemas.storedQuerySchema);

exports.StoredQueryModel = StoredQueryModel;

exports.getStream = condition => {
    return StoredQueryModel.find(condition).sort({_id: -1}).cursor();
};
exports.count = (condition, callback) => {
    StoredQueryModel.count(condition, callback);
};


exports.type = "storedQuery";
exports.name = "storedQueries";

