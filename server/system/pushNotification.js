const _ = require('lodash');
const webpush = require('web-push');

const dbLogger = require('./dbLogger.js');
const mongo_data = require('./mongo-data');

function handleError(res, cb) {
    function errorHandler(res, cb, err, ...args) {
        if (err) {
            return respondError(res, err);
        }
        cb(...args);
    }
    return errorHandler.bind(undefined, res, cb);
}

function logError(err) {
    if (err) {
        dbLogger.logError(err);
    }
}

function respondError(res, err, message = '') {
    res.status(500).send(message);
    dbLogger.logError(err);
}

exports.create = (req, res) => {
    if (!req.body.subscription || !req.body.subscription.endpoint) {
        return exports.createUnsubscribed(req, res);
    }
    mongo_data.pushesByEndpoint(req.body.subscription.endpoint, handleError(res, pushes => {
        if (!pushes || !pushes.length) {
            return exports.createUnsubscribed(req, res);
        }
        let ownPushes = pushes.filter(push => push.userId === req.user._id);
        if (ownPushes.length) {
            let push = ownPushes[0];
            if (!push.loggedIn) {
                push.loggedIn = true;
                push.save(handleError(res, () => {
                    res.send({subscribed: true});
                }));
            } else {
                res.send({subscribed: true});
            }
        } else {
            pushes.forEach(push => {
                if (push.loggedIn) {
                    push.loggedIn = false;
                    push.save(logError);
                }
            });
            mongo_data.pushCreate({
                features: Array.isArray(req.body.features) ? req.body.features : ['all'],
                loggedIn: true,
                subscription: req.body.subscription,
                userId: req.user._id,
                vapidKeys: pushes[0].vapidKeys,
            }, handleError(res, () => {
                res.send({subscribed: true});
            }));
        }
    }));
};

exports.createUnsubscribed = (req, res) => {
    mongo_data.pushCreate({vapidKeys: webpush.generateVAPIDKeys()}, handleError(res, push => {
        res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false});
    }));
};

exports.delete = (req, res) => {
    if (!req.body.endpoint) {
        return res.status(400).send('Required parameters missing.');
    }
    mongo_data.pushDelete(req.body.endpoint, req.user._id, err => {
        if (err) {
            return respondError(res, err, 'Error: did not remove.');
        }
        res.send();
    });
};

exports.subscribe = (req, res) => {
    if (!req.body.applicationServerKey) {
        return res.status(400).send('Required parameters missing.');
    }
    if (!req.body || !req.body.subscription || !req.body.subscription.endpoint) {
        return res.status(400).json({
            error: {
                id: 'no-endpoint',
                message: 'Subscription must have an endpoint.'
            }
        });
    }
    mongo_data.pushByPublicKey(req.body.applicationServerKey, handleError(res, push => {
        if (!push) {
            return res.status(400).send('push registration must be created before it is subscribed to.');
        }
        push.features = _.union(push.features, req.body.features);
        push.loggedIn = true;
        push.subscription = req.body.subscription;
        push.userId = req.user._id;
        push.save(handleError(res, push => {
            res.send(push.features);
        }));
    }));
};

exports.triggerPushMsg = (push, dataToSend) => {
    if (!push.subscription) return;

    webpush.setVapidDetails(
        'https://cde.nlm.nih.gov',
        push.vapidKeys.publicKey,
        push.vapidKeys.privateKey
    );
    return webpush.sendNotification(push.subscription, dataToSend)
        .catch(err => {
            if (err.name === 'WebPushError' && err.message === 'Received unexpected response code') { // endpoint gone
                push.remove()
                    // .then(() => dbLogger.consoleLog('PushNotification trigger removed: ' + pushReg.userId + ' ' + pushReg.subscription.endpoint))
                    .catch(dbLogger.logError);
            } else { // currently unknown error
                dbLogger.logError({
                    message: "Error pushing notification: " + dataToSend,
                    origin: "pushNotification.triggerPushMsg",
                    stack: err,
                    details: ""
                });
            }
        });
};

exports.updateStatus = (req, res) => {
    if (!req.body.endpoint) {
        return res.status(400).send('Error: no subscription');
    }
    if (req.user) {
        // start
        mongo_data.pushByIds(req.body.endpoint, req.user._id, handleError(res, push => {
            mongo_data.pushByIdsCount(req.body.endpoint, undefined, handleError(res, countExists => {
                function respond() {
                    res.send({status: !!push, exist: !!countExists});
                }
                if (!push || push.loggedIn) {
                    return respond();
                }
                push.update({$set: {loggedIn : true}}, undefined, handleError(res, respond));
            }));
        }));
    } else {
        // stop
        mongo_data.pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn : false}}, handleError(res, () => {
            res.send({status: false, exist: true});
        }));
    }
};