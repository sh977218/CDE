const webpush = require('web-push');

const config = require('./parseConfig');
const dbLogger = require('./dbLogger.js');
const mongo_data = require('./mongo-data');

webpush.setVapidDetails(
    'mailto:web-push-book@gauntface.com',
    config.webpush.vapidKeys.publicKey,
    config.webpush.vapidKeys.privateKey
);

exports.isValidSaveRequest = (req, res) => {
    // Check the request body has at least an endpoint.
    if (!req.body || !req.body.subscription || !req.body.subscription.endpoint) {
        // Not a valid subscription.
        res.status(400).json({
            error: {
                id: 'no-endpoint',
                message: 'Subscription must have an endpoint.'
            }
        });
        return false;
    }
    return true;
};

exports.triggerPushMsg = (pushReg, dataToSend) => {
    return webpush.sendNotification(pushReg.subscription, dataToSend)
        .catch(err => {
            if (err.name === 'WebPushError' && err.message === 'Received unexpected response code') { // endpoint gone
                pushReg.remove()
                    // .then(() => dbLogger.consoleLog('PushNotification trigger removed: ' + pushReg.userId + ' ' + pushReg.subscription.endpoint))
                    .catch(dbLogger.logError);
            } else { // currently unknown error
                dbLogger.logError(err);
            }
        });
};

function handleError(res, cb, err, ...args) {
    if (err) {
        return exports.processError(res, err);
    }
    cb(...args);
}

exports.processError = function (res, err, message = '') {
    res.status(500).send(message);
    dbLogger.logError(err);
};

exports.updateStatus = (req, res) => {
    if (req.user) {
        // start
        mongo_data.pushByIds(req.body.endpoint, req.user._id, handleError.bind(undefined, res, push => {
            mongo_data.pushByIdsCount(req.body.endpoint, undefined, handleError.bind(undefined, res, countExists => {
                function respond() {
                    res.send({status: !!push, exist: !!countExists});
                }
                if (!push || push.loggedIn) {
                    return respond();
                }
                push.update({$set: {loggedIn : true}}, undefined, handleError.bind(undefined, res, respond));
            }));
        }));
    } else {
        // stop
        mongo_data.pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn : false}}, handleError.bind(undefined, res, () => {
            res.send({status: false, exist: true});
        }));
    }
};
