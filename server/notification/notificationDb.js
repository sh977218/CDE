const ClientErrorModel = require('../log/dbLogger').ClientErrorModel;
const LogErrorModel = require('../log/dbLogger').LogErrorModel;

exports.getNumberServerError = (user, callback) => {
    let query = LogErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {}
    );
    if (callback) query.exec(callback);
    else return query.exec();
};
exports.getNumberClientError = (user, callback) => {
    let query = ClientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    );
    if (callback) query.exec(callback);
    else return query.exec;
};
