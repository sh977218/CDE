import { Request, Response } from 'express';
import { union } from 'lodash';
import { config, ObjectId } from 'server';
import { respondError } from 'server/errorHandler';
import { logError } from 'server/log/dbLogger';
import {
    pushById, pushByIds, pushByIdsCount, pushByPublicKey, pushClearDb, pushDelete, pushEndpointUpdate, pushesByEndpoint,
    pushFindActive, pushSave
} from 'server/notification/notificationDb';
import { PushRegistrationDocument } from 'server/system/mongo-data';
import { partition } from 'shared/array';
import {
    PushRegistrationCreateRequest, PushRegistrationCreateResponse, PushRegistrationDeleteRequest,
    PushRegistrationSubscribeRequest, PushRegistrationSubscribeResponse,
    PushRegistrationUpdateRequest, PushRegistrationUpdateResponse
} from 'shared/boundaryInterfaces/API/notification';
import { User } from 'shared/models.model';
import { noop } from 'shared/util';
import { generateVAPIDKeys, sendNotification, setVapidDetails } from 'web-push';

export function checkDatabase(callback = noop) {
    pushById('000000000000000000000000').then(push => {
        function createDbTag() {
            pushSave({_id: new ObjectId('000000000000000000000000'), features: [config.publicUrl]})
                .then(callback, respondError());
        }

        if (!push) {
            createDbTag();
            return;
        }
        if (!push.features || !push.features.includes(config.publicUrl)) {
            pushClearDb().then(createDbTag, respondError({publicMessage: 'could not remove'}));
            return;
        }
        callback();
    }, respondError());
}

export function create(req: Request, res: Response): Promise<Response> {
    // new registration: 1/2 create keys to request subscription with
    return pushSave({vapidKeys: generateVAPIDKeys()})
        .then(
            push => res.send({applicationServerKey: push.vapidKeys.publicKey, subscribed: false} as PushRegistrationCreateResponse),
            respondError({req, res})
        );
}

export function created(req: Request, res: Response): Promise<Response> {
    // new registration: 2/2 receive a subscription for the keys
    const body: PushRegistrationSubscribeRequest = req.body;
    if (!body.applicationServerKey || !req.user || !req.user._id) {
        return Promise.resolve(res.status(400).send('Required parameters missing.'));
    }
    if (!body || !body.subscription || !body.subscription.endpoint) {
        return Promise.resolve(res.status(400).json({
            error: {
                id: 'no-endpoint',
                message: 'Subscription must have an endpoint.'
            }
        }));
    }
    return pushByPublicKey(body.applicationServerKey)
        .then(push => {
            if (!push) {
                return res.status(400).send('push registration must be created before it is subscribed to.');
            }
            push.features = union(push.features, body.features);
            push.loggedIn = true;
            push.subscription = body.subscription;
            push.userId = req.user._id;
            return push.save()
                .then(push => res.send(push.features as PushRegistrationSubscribeResponse));
        })
        .catch(respondError({req, res}));
}

export function pushRegistrationsFor(getUsers: () => Promise<User[]>): Promise<PushRegistrationDocument[]> {
    return getUsers()
        .then(users => users.length
            ? pushFindActive({userId: {$in: users.map(u => u._id)}})
            : []
        );
}

export function pushRegistrationSubscribersByUsers(users: User[]): Promise<PushRegistrationDocument[]> {
    return pushFindActive({userId: {$in: users.map(u => u._id.toString())}});
}

export function register(req: Request, res: Response): Promise<Response> {
    const body: PushRegistrationCreateRequest = req.body;
    if (!req.user || !req.user._id) {
        return Promise.resolve(res.status(400).send('Required parameters missing.'));
    }
    if (!body.subscription || !body.subscription.endpoint) {
        return create(req, res);
    }
    const subscription = body.subscription;
    return pushesByEndpoint(subscription.endpoint)
        .then(pushes => {
            if (!pushes || !pushes.length) {
                return create(req, res);
            }
            const [ownRegistrations, othersRegistations] = partition(pushes, push => push && push.userId === req.user._id);
            return Promise.all(othersRegistations.map(reg => {
                if (reg.loggedIn) {
                    reg.loggedIn = false;
                    return reg.save();
                }
            }))
                .then(() => {
                    if (ownRegistrations.length) {
                        const reg = ownRegistrations[0];
                        if (reg.loggedIn) {
                            return res.send({subscribed: true} as PushRegistrationCreateResponse);
                        }
                        reg.loggedIn = true;
                        return reg.save()
                            .then(() => res.send({subscribed: true} as PushRegistrationCreateResponse));
                    } else {
                        return create(req, res);
                    }
                });
        })
        .catch(respondError({req, res}));
}

export function remove(req: Request, res: Response): Promise<Response> {
    const body: PushRegistrationDeleteRequest = req.body;
    if (!body.endpoint || !req.user || !req.user._id) {
        return Promise.resolve(res.status(400).send('Required parameters missing.'));
    }
    return pushDelete(body.endpoint, req.user._id)
        .then(() => res.send(), respondError({req, res, publicMessage: 'could not remove'}));
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

export function updateStatus(req: Request, res: Response): Promise<Response> {
    const body: PushRegistrationUpdateRequest = req.body;
    if (!body.endpoint) {
        return Promise.resolve(res.status(400).send('Error: no subscription'));
    }
    if (req.user) {
        // start
        return pushByIds(body.endpoint, req.user._id)
            .then(push => {
                function respond() {
                    return res.send({status: !!push} as PushRegistrationUpdateResponse);
                }

                if (!push || push.loggedIn) {
                    return respond();
                }
                return push.updateOne({$set: {loggedIn: true}}).then(respond);
            })
            .catch(respondError({req, res}));
    } else {
        // stop
        return pushEndpointUpdate(body.endpoint, {$set: {loggedIn: false}})
            .then(() => res.send({status: false} as PushRegistrationUpdateResponse), respondError({req, res}));
    }
}
