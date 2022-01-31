import { DELETE, POST } from '_commonApp/fetch';
import {
    PushRegistrationCreateRequest,
    PushRegistrationCreateResponse,
    PushRegistrationDeleteRequest,
    PushRegistrationSubscribeRequest,
    PushRegistrationSubscribeResponse,
    PushRegistrationUpdateRequest,
    PushRegistrationUpdateResponse,
    PushSubscriptionJson
} from 'shared/boundaryInterfaces/API/notification';
import { noop } from 'shared/util';

let _registration: Promise<ServiceWorkerRegistration> | null = null;
let subscribedUserId: string | null = null;

function askForNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
        return Promise.reject(new Error('This browser does not support notifications.'));
    }
    // handle both old callback and new Promise implementations
    return new Promise<string>((resolve, reject) => {
        const promise = Notification.requestPermission(resolve);
        if (promise) {
            promise.then(resolve, reject);
        }
    })
        .then((permissionResult: string) => permissionResult === 'granted'
            ? Promise.resolve()
            : Promise.reject(new Error('Notification permission denied.'))
        );
}

function getRegistration(): Promise<ServiceWorkerRegistration> {
    return _registration || Promise.reject('no service worker');
}

function getServerStatus(userId: string | null): Promise<void> {
    return getSubscriptionEndpoint().then(endpoint => {
        if (!endpoint) {
            throw new Error('Not Subscribed.');
        }
        return POST<PushRegistrationUpdateRequest, PushRegistrationUpdateResponse>(
            '/server/notification/pushRegistrationUpdate',
            {
                endpoint,
                features: ['all']
            }
        )
            .then(res => {
                if (res.status) {
                    subscribedUserId = userId;
                } else {
                    throw new Error('This subscription does not exist.');
                }
            }, processError);
    })
}


function getSubscription(): Promise<PushSubscription | null> {
    return getRegistration()
        .then(registration => registration.pushManager.getSubscription());
}

function getSubscriptionEndpoint(): Promise<string | null> {
    return getSubscription()
        .then(pushSubscription => pushSubscription && pushSubscription.endpoint);
}

function getSubscriptionForAppKey(applicationServerKey: string): Promise<PushSubscription> {
    return getSubscription().then(async pushSubscription => {
        if (!(pushSubscription?.options?.applicationServerKey?.toString() === applicationServerKey)) {
            await pushSubscription?.unsubscribe();
        }
        return getRegistration()
            .then(registration => registration.pushManager.subscribe({
                applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                userVisibleOnly: true,
            }))
            .then(pushSubscription => {
                if (!pushSubscription || !pushSubscription.getKey || !pushSubscription.endpoint) {
                    return Promise.reject('Bad syntax.');
                }
                return pushSubscription;
            });
    });
}

function processError(error: Error | string | void): Promise<never> {
    if (error instanceof Error) {
        reportError(error);
        if (error.message.indexOf('denied')) {
            alert(`Your browser preferences prevent notifications from this website. (${error.message})`);
            return Promise.reject();
        }
        if (error.message === 'Failed to fetch' || error.message === 'Unexpected token < in JSON at position 0') {
            throw new Error('Server is not available or you are offline.');
        }
    }
    throw error;
}

function reportError(error: Error): void {
    POST('./server/log/clientExceptionLogs', {
        stack: error.stack,
        message: error.message,
        name: error.name,
        url: window.location.href
    }).then(noop, noop);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    ;
    const rawData = window.atob(base64);
    return Uint8Array.from(Array.from(rawData).map(char => char.charCodeAt(0)));
}

export function getStatus(userId: string): boolean {
    return userId === subscribedUserId;
}

export function onLoad(): void {
    _registration = (
        'serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
            ? navigator.serviceWorker.register('/sw.js')
            : null
    );
}

// on timeout no action
export function signInOut(userId: string | null): Promise<void> {
    return getServerStatus(userId);
}

export function subscribe(userId: string): Promise<PushSubscription | null> {
    return askForNotificationPermission()
        .then(getSubscription)
        .then(pushSubscription => POST<PushRegistrationCreateRequest, PushRegistrationCreateResponse>(
                '/server/notification/pushRegistration',
                {
                    features: ['all'],
                    subscription: pushSubscription as unknown as PushSubscriptionJson | null,
                },
            )
                .then(res => {
                    if (res.subscribed) {
                        return pushSubscription;
                    }
                    if (!res.applicationServerKey) {
                        return Promise.reject('');
                    }
                    return getSubscriptionForAppKey(res.applicationServerKey)
                        .then(pushSubscription => POST<PushRegistrationSubscribeRequest, PushRegistrationSubscribeResponse>(
                                '/server/notification/pushRegistration/subscription',
                                {
                                    applicationServerKey: res.applicationServerKey,
                                    features: ['all'],
                                    subscription: pushSubscription as unknown as PushSubscriptionJson,
                                }
                            )
                                .then(() => pushSubscription, processError)
                        );
                }, processError)
                .then(pushSubscription => {
                    if (pushSubscription) {
                        subscribedUserId = userId;
                    }
                    return pushSubscription;
                })
        );
}

export function unsubscribe(userId: string): Promise<void> {
    if (!getStatus(userId)) {
        return Promise.reject('Not Subscribed');
    }
    return getSubscriptionEndpoint().then(endpoint => {
        if (!endpoint) {
            return Promise.reject('Not Your Subscription');
        }
        return DELETE<PushRegistrationDeleteRequest>('/server/notification/pushRegistration', {
            endpoint,
            features: ['all']
        })
            .then(() => {
                subscribedUserId = null;
            }, processError);
    });
}
