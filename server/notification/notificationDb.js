const ClientErrorModel = require('../log/dbLogger').ClientErrorModel;
const LogErrorModel = require('../log/dbLogger').LogErrorModel;

exports.getNumberServerError = (user, callback) => {
    let promise = LogErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {}
    ).exec();
    if (callback) promise.then(callback);
    else return promise;
};
exports.getNumberClientError = (user, callback) => {
    let promise = ClientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    ).exec();
    if (callback) promise.then(callback);
    else return promise;
};
