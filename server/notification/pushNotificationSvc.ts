import { RequestHandler } from 'express';
import { find, noop, union } from 'lodash';
import { handleError } from 'server/errorHandler/errorHandler';
import {
    pushById, pushByIds, pushByIdsCount, pushByPublicKey, pushClearDb, pushCreate, pushDelete, pushEndpointUpdate, pushesByEndpoint,
    pushRegistrationFindActive
} from 'server/notification/notificationDb';
import { ObjectId, objectId, PushRegistrationDocument } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { logError } from 'server/log/dbLogger';
import { criteriaSet, NotificationType, typeToCriteria, typeToNotificationSetting } from 'server/notification/notificationSvc';
import { find as userFind } from 'server/user/userDb';
import { CbError, CbError1, User } from 'shared/models.model';
import { generateVAPIDKeys, sendNotification, setVapidDetails } from 'web-push';

export function checkDatabase(callback = noop) {
    // errorHandler.handleError because of circular dependency.
    pushById('000000000000000000000000', handleError({}, push => {
        function createDbTag() {
            pushCreate(
                {_id: objectId('000000000000000000000000'), userId: config.publicUrl},
                handleError({}, callback)
            );
        }

        if (!push) {
            createDbTag();
            return;
        }
        if (push.userId !== config.publicUrl) {
            pushClearDb(handleError({publicMessage: 'could not remove'}, createDbTag));
            return;
        }
        callback();
    }));
}

export const create: RequestHandler = (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    if (!req.body.subscription || !req.body.subscription.endpoint) {
        return createUnsubscribed(req, res);
    }
    pushesByEndpoint(req.body.subscription.endpoint, handleError({req, res}, pushes => {
        if (!pushes || !pushes.length) {
            return createUnsubscribed(req, res);
        }
        const ownPushes = pushes.filter(push => push.userId === req.user._id);
        if (ownPushes.length) {
            const push = ownPushes[0];
            if (!push.loggedIn) {
                push.loggedIn = true;
                push.save(handleError<PushRegistrationDocument>({req, res}, () => {
                    res.send({subscribed: true});
                }));
            } else {
                res.send({subscribed: true});
            }
        } else {
            pushes.forEach(push => {
                if (push.loggedIn) {
                    push.loggedIn = false;
                    push.save(handleError<PushRegistrationDocument>({req, res}, noop));
                }
            });
            pushCreate({
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
};

export function createUnsubscribed(req, res) {
    pushCreate({vapidKeys: generateVAPIDKeys()}, handleError({req, res}, push => {
        res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false});
    }));
}

export function remove(req, res) {
    if (!req.body.endpoint || !req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    pushDelete(req.body.endpoint, req.user._id,
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
    pushByPublicKey(req.body.applicationServerKey, handleError({req, res}, push => {
        if (!push) {
            return res.status(400).send('push registration must be created before it is subscribed to.');
        }
        push.features = union(push.features, req.body.features);
        push.loggedIn = true;
        push.subscription = req.body.subscription;
        push.userId = req.user._id;
        push.save(handleError<PushRegistrationDocument>({req, res}, push => res.send(push.features)));
    }));
}

export function triggerPushMsg(push, dataToSend) {
    if (!push.subscription) {
        return;
    }
    if (['green', 'qa-green'].includes((global as any).CURRENT_SERVER_ENV)) {
        return;
    }

    setVapidDetails(
        'https://cde.nlm.nih.gov',
        push.vapidKeys.publicKey,
        push.vapidKeys.privateKey
    );
    return sendNotification(push.subscription, dataToSend)
        .catch(err => {
            if (err.name === 'WebPushError' && err.message === 'Received unexpected response code') {
                push.remove().catch(logError);
            } else {
                logError({
                    message: 'Error pushing notification: ' + dataToSend,
                    origin: 'pushNotification.triggerPushMsg',
                    stack: err,
                    details: ''
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
        pushByIds(req.body.endpoint, req.user._id, handleError({req, res}, push => {
            pushByIdsCount(req.body.endpoint, undefined, handleError({req, res}, countExists => {
                function respond() {
                    res.send({status: !!push, exist: !!countExists});
                }

                if (!push || push.loggedIn) {
                    return respond();
                }
                push.updateOne({$set: {loggedIn: true}}, {}, handleError({req, res}, respond));
            }));
        }));
    } else {
        // stop
        pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn: false}}, handleError({req, res}, () => {
            res.send({status: false, exist: true});
        }));
    }
}

export function pushRegistrationSubscribersByType(type: NotificationType, cb: CbError<PushRegistrationDocument[]>,
                                                  data?: {org?: string, users: ObjectId[]}) {
    userFind(
        criteriaSet(
            typeToCriteria(type, data),
            'notificationSettings.' + typeToNotificationSetting(type) + '.push'
        ),
        (err, users) => {
            if (err || !users) {
                cb(err);
                return;
            }
            pushRegistrationSubscribersByUsers(users, cb);
        }
    );
}

export function pushRegistrationSubscribersByUsers(users: User[], cb: CbError1<PushRegistrationDocument[]>) {
    const userIds = users.map(u => u._id.toString());
    pushRegistrationFindActive({userId: {$in: userIds}}, cb);
}