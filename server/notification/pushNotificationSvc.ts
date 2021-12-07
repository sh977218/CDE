import { Request, Response } from 'express';
import { noop, union } from 'lodash';
import { config, ObjectId } from 'server';
import { handleError, handleErrorVoid } from 'server/errorHandler/errorHandler';
import { logError } from 'server/log/dbLogger';
import {
    pushById, pushByIds, pushByIdsCount, pushByPublicKey, pushClearDb, pushDelete, pushEndpointUpdate, pushesByEndpoint,
    pushFindActive, pushSave
} from 'server/notification/notificationDb';
import { PushRegistrationDocument } from 'server/system/mongo-data';
import { CbError1, User } from 'shared/models.model';
import { generateVAPIDKeys, sendNotification, setVapidDetails } from 'web-push';

export function checkDatabase(callback = noop) {
    // errorHandler.handleError because of circular dependency.
    pushById('000000000000000000000000', handleError({}, push => {
        function createDbTag() {
            pushSave(
                {_id: new ObjectId('000000000000000000000000'), features: [config.publicUrl]},
                handleError({}, callback)
            );
        }

        if (!push) {
            createDbTag();
            return;
        }
        if (!push.features || !push.features.includes(config.publicUrl)) {
            pushClearDb(handleErrorVoid({publicMessage: 'could not remove'}, createDbTag));
            return;
        }
        callback();
    }));
}

export function create(req: Request, res: Response) {
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
        const ownPushes = pushes.filter(push => push && push.userId === req.user._id);
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
            pushSave({
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

export function createUnsubscribed(req: Request, res: Response) {
    pushSave({vapidKeys: generateVAPIDKeys()}, handleError({req, res}, push => {
        res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false});
    }));
}

export function remove(req: Request, res: Response) {
    if (!req.body.endpoint || !req.user || !req.user._id) {
        return res.status(400).send('Required parameters missing.');
    }
    pushDelete(req.body.endpoint, req.user._id,
        handleErrorVoid({req, res, publicMessage: 'could not remove'}, () => res.send()));
}

export function subscribe(req: Request, res: Response) {
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

export function triggerPushMsg(push: PushRegistrationDocument, dataToSend: string) {
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

export function updateStatus(req: Request, res: Response) {
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
        pushEndpointUpdate(req.body.endpoint, {$set: {loggedIn: false}}, handleErrorVoid({req, res}, () => {
            res.send({status: false, exist: true});
        }));
    }
}

export function pushRegistrationSubscribersByUsers(users: User[], cb: CbError1<PushRegistrationDocument[]>) {
    const userIds = users.map(u => u._id.toString());
    pushFindActive({userId: {$in: userIds}}, cb);
}
