const ClientErrorModel = require('../log/dbLogger').ClientErrorModel;
const LogErrorModel = require('../log/dbLogger').LogErrorModel;

exports.getNumberServerError = (user, callback) => {
    if (user.notificationDate.serverLogDate) {
        LogErrorModel.count({date: {$lt: user.notificationDate.serverLogDate}}, callback);
    }
    else LogErrorModel.count({}, callback);
};
exports.getNumberClientError = (user, callback) => {
    if (user.notificationDate.clientLogDate) {
        ClientErrorModel.count({date: {$lt: user.notificationDate.clientLogDate}}, callback);
    }
    else ClientErrorModel.count({}, callback);
};