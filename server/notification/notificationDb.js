const clientError = require('../log/schemas').clientErrorSchema;
const logError = require('../log/schemas').logErrorSchema;

exports.getNumberServerError = (user, callback) => {
    if (user.notificationDate.serverLogDate) {
        logError.count({}, callback);
    }
    else logError.count({date: {$lt: user.notificationDate.serverLogDate}}, callback)
};
exports.getNumberClientError = (user, callback) => {
    if (user.notificationDate.clientLogDate) {
        clientError.count({}, callback);
    }
    else clientError.count({date: {$lt: user.notificationDate.clientLogDate}}, callback)
};