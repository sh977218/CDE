const dbLogger = require('./dbLogger.js');
const mongo_data = require('./mongo-data');
const webpush = require('web-push');

const vapidKeys = {
    publicKey: 'BMkcEZwp4FAtBNKF46gUMZsu9AU7Xpi5lbWR_Q0ng-Pm2uSznyjCO9_pBOsOown3WaNlQPR6GhwNdB5W0TisO5M',
    privateKey: 'KdsCVQ3PgL8Lck7iuMBABSVelhrYQbLFzD4ARUvZloc'
};
webpush.setVapidDetails(
    'mailto:web-push-book@gauntface.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
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
        return res.status(500).end();
    }
    cb(...args);
}

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
