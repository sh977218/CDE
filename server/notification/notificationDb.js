const ClientErrorModel = require('../log/dbLogger').ClientErrorModel;
const LogErrorModel = require('../log/dbLogger').LogErrorModel;

exports.getNumberServerError = (user, callback) => {
    LogErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {},
        callback
    );
};
exports.getNumberClientError = (user, callback) => {
    ClientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {},
        callback
    );
};
