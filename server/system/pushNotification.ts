import { handleError } from '../errorHandler/errorHandler';
import { config } from '../system/parseConfig';

const _ = require('lodash');
const webpush = require('web-push');
const mongo_data = require('./mongo-data');
const dbLogger = require('../log/dbLogger');

export function checkDatabase(callback = _.noop) {
    // errorHandler.handleError because of circular dependency.
    mongo_data.pushById('000000000000000000000000', handleError({}, push => {
        function createDbTag() {
            mongo_data.pushCreate(
                {_id: mongo_data.ObjectId('000000000000000000000000'), userId: config.publicUrl},
                handleError({}, callback)
            );
        }

        if (!push) {
            createDbTag();
            return;
        }
        if (push.userId !== config.publicUrl) {
            mongo_data.pushClearDb(handleError({publicMessage: 'could not remove'}, createDbTag));
            return;
        }
        callback();
    }));
}

export function create(req, res) {
    if (!req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    if (!req.body.subscription || !req.body.subscription.endpoint) {
        return createUnsubscribed(req, res);
    }
    mongo_data.pushesByEndpoint(req.body.subscription.endpoint, handleError({req, res}, pushes => {
        if (!pushes || !pushes.length) {
            return createUnsubscribed(req, res);
        }
        let ownPushes = pushes.filter(push => push.userId === req.user._id);
        if (ownPushes.length) {
            let push = ownPushes[0];
            if (!push.loggedIn) {
                push.loggedIn = true;
                push.save(handleError({req, res}, () => {
                    res.send({subscribed: true});
                }));
            } else {
                res.send({subscribed: true});
            }
        } else {
            pushes.forEach(push => {
                if (push.loggedIn) {
                    push.loggedIn = false;
                    push.save(handleError({req, res}, _.noop));
                }
            });
            mongo_data.pushCreate({
                features: Array.isArray(req.body.features) ? req.body.features : ['all'],
                loggedIn: true,
                subscription: req.body.subscription,
                userId: req.user._id,
                vapidKeys: pushes[0].vapidKeys,
            }, handleError({req, res}, () => {
                res.send({subscribed: true});
            }));
        }
    }));
}

export function createUnsubscribed(req, res) {
    mongo_data.pushCreate({vapidKeys: webpush.generateVAPIDKeys()}, handleError({req, res}, push => {
        res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false});
    }));
}

export function remove(req, res) {
    if (!req.body.endpoint || !req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    mongo_data.pushDelete(req.body.endpoint, req.user._id,
        handleError({req, res, publicMessage: 'could not remove'}, data => res.send(data)));
}

export function subscribe(req, res) {
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
    mongo_data.pushByPublicKey(req.body.applicationServerKey, handleError({req, res}, push => {
        if (!push) {
            return res.status(400).send('push registration must be created before it is subscribed to.');
        }
        push.features = _.union(push.features, req.body.features);
        push.loggedIn = true;
        push.subscription = req.body.subscription;
        push.userId = req.user._id;
        push.save(handleError({req, res}, push => res.send(push.features)));
    }));
}

export function triggerPushMsg(push, dataToSend) {
    if (!push.subscription) return;
    if (['green', 'qa-green'].includes((global as any).CURRENT_SERVER_ENV)) return;

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
}

export function updateStatus(req, res) {
    if (!req.body.endpoint) {
        return res.status(400).send('Error: no subscription');
    }
    if (req.user) {
        // start
        mongo_data.pushByIds(req.body.endpoint, req.user._id, handleError({req, res}, push => {
            mongo_data.pushByIdsCount(req.body.endpoint, undefined, handleError({req, res}, countExists => {
                function respond() {
                    res.send({status: !!push, exist: !!countExists});
                }

                if (!push || push.loggedIn) return respond();
                push.updateOne({$set: {loggedIn: true}}, undefined, handleError({req, res}, respond));
            }));
        }));
    } else {
        // stop
        mongo_data.pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn: false}}, handleError({req, res}, () => {
            res.send({status: false, exist: true});
        }));
    }
}
