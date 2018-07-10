const _ = require('lodash');
const webpush = require('web-push');

const config = require('./parseConfig');
const dbLogger = require('../log/dbLogger.js');
const mongo_data = require('./mongo-data');

exports.checkDatabase = (callback = _.noop) => {
    mongo_data.pushById('000000000000000000000000', dbLogger.handleError({origin: 'pushNotification.checkDatabase'}, push => {
        function createDbTag() {
            mongo_data.pushCreate(
                {_id: mongo_data.ObjectId('000000000000000000000000'), userId: config.publicUrl},
                dbLogger.handleError({origin: 'pushNotification.checkDatabase'}, callback)
            );
        }

        if (!push) {
            createDbTag();
            return;
        }
        if (push.userId !== config.publicUrl) {
            mongo_data.pushClearDb(dbLogger.handleError({publicMessage: 'could not remove', origin: 'pushNotification.checkDatabase'},
                createDbTag));
            return;
        }
        callback();
    }));
};

exports.create = (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    if (!req.body.subscription || !req.body.subscription.endpoint) {
        return exports.createUnsubscribed(req, res);
    }
    mongo_data.pushesByEndpoint(req.body.subscription.endpoint, dbLogger.handleError({
        res,
        origin: 'pushNotification.create'
    }, pushes => {
        if (!pushes || !pushes.length) {
            return exports.createUnsubscribed(req, res);
        }
        let ownPushes = pushes.filter(push => push.userId === req.user._id);
        if (ownPushes.length) {
            let push = ownPushes[0];
            if (!push.loggedIn) {
                push.loggedIn = true;
                push.save(dbLogger.handleError({res, origin: 'pushNotification.create'}, () => {
                    res.send({subscribed: true});
                }));
            } else {
                res.send({subscribed: true});
            }
        } else {
            pushes.forEach(push => {
                if (push.loggedIn) {
                    push.loggedIn = false;
                    push.save(dbLogger.handleError({res, origin: 'pushNotification.create'}, _.noop));
                }
            });
            mongo_data.pushCreate({
                features: Array.isArray(req.body.features) ? req.body.features : ['all'],
                loggedIn: true,
                subscription: req.body.subscription,
                userId: req.user._id,
                vapidKeys: pushes[0].vapidKeys,
            }, dbLogger.handleError({res, origin: 'pushNotification.create'}, () => {
                res.send({subscribed: true});
            }));
        }
    }));
};

exports.createUnsubscribed = (req, res) => {
    mongo_data.pushCreate({vapidKeys: webpush.generateVAPIDKeys()}, dbLogger.handleError({res, origin: 'pushNotification.createUnsubscribed'}, push => {
        res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false});
    }));
};

exports.delete = (req, res) => {
    if (!req.body.endpoint || !req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    mongo_data.pushDelete(req.body.endpoint, req.user._id, dbLogger.handleError({res, publicMessage: 'could not remove', origin: 'pushNotification.delete'}, data =>
        res.send(data)));
};

exports.subscribe = (req, res) => {
    if (!req.body.applicationServerKey || !req.user || !req.user._id) {
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
    mongo_data.pushByPublicKey(req.body.applicationServerKey, dbLogger.handleError({res, origin: 'pushNotification.subscribe'}, push => {
        if (!push) {
            return res.status(400).send('push registration must be created before it is subscribed to.');
        }
        push.features = _.union(push.features, req.body.features);
        push.loggedIn = true;
        push.subscription = req.body.subscription;
        push.userId = req.user._id;
        push.save(dbLogger.handleError({res, origin: 'pushNotification.subscribe'}, push =>
            res.send(push.features)));
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
            if (err.name === 'WebPushError' && err.message === 'Received unexpected response code') {
                push.remove().catch(dbLogger.logError);
            } else {
                dbLogger.logError({
                    message: 'Error pushing notification: ' + dataToSend,
                    origin: 'pushNotification.triggerPushMsg',
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
        mongo_data.pushByIds(req.body.endpoint, req.user._id, dbLogger.handleError({res, origin: 'pushNotification.updateStatus'}, push => {
            mongo_data.pushByIdsCount(req.body.endpoint, undefined, dbLogger.handleError({res, origin: 'pushNotification.updateStatus'}, countExists => {
                function respond() {
                    res.send({status: !!push, exist: !!countExists});
                }

                if (!push || push.loggedIn) return respond();
                push.update({$set: {loggedIn: true}}, undefined, dbLogger.handleError({res, origin: 'pushNotification.updateStatus'}, respond));
            }));
        }));
    } else {
        // stop
        mongo_data.pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn: false}}, dbLogger.handleError({res, origin: 'pushNotification.updateStatus'}, () => {
            res.send({status: false, exist: true});
        }));
    }
};
