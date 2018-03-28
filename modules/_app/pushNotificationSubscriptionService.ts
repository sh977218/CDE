import _noop from 'lodash/noop';

export class PushNotificationSubscriptionService {
    static get lastEndpoint() {
        return window.localStorage.getItem('nlmcde.push');
    }
    static set lastEndpoint(endpoint) {
        window.localStorage.setItem('nlmcde.push', endpoint);
    }
    static get lastUser() {
        return window.localStorage.getItem('nlmcde.push1');
    }
    static set lastUser(userId) {
        window.localStorage.setItem('nlmcde.push1', userId);
    }
    static registration = new Promise<ServiceWorkerRegistration>((resolve, reject) => {
        PushNotificationSubscriptionService.registrationResolve = resolve;
        PushNotificationSubscriptionService.registrationReject = reject;
    });
    static registrationResolve;
    static registrationReject;

    static askNotificationPermission(): Promise<void> {
        // handle both old callback and new Promise implementations
        return new Promise<string>((resolve, reject) => {
            const promise = Notification.requestPermission(resolve);
            if (promise) {
                promise.then(resolve, reject);
            }
        })
            .then((permissionResult: string) => {
                return new Promise<void>((resolve, reject) => {
                    if (permissionResult === 'granted') {
                        resolve();
                    } else {
                        reject('Notification permission denied.');
                    }
                });
            });
    }

    static getEndpoint(): Promise<void> {
        if (this.lastEndpoint) {
            return Promise.resolve();
        } else {
            // generate new endpoint
            return this.registration.then(registration => {
                return registration.pushManager.getSubscription()
                    .then((pushSubscription: PushSubscription) => {
                        if (pushSubscription && pushSubscription.endpoint) {
                            this.lastEndpoint = pushSubscription.endpoint;
                            return Promise.resolve();
                        } else {
                            return Promise.reject('No subscription.');
                        }
                    });
            });
        }
    }

    static fetchError(error) {
        PushNotificationSubscriptionService.handleError(error);
        if (error instanceof Error
            && (error.message === 'Failed to fetch' || error.message === 'Unexpected token < in JSON at position 0')) {
            return Promise.reject('Server is not available or you are offline.');
        }
        return Promise.reject(error);
    }

    static handleError(error) {
        fetch('./logClientException', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                stack: error.stack,
                message: error.message,
                name: error.name,
                url: window.location.href
            }),
        });
    }

    static subscriptionCheckClient(): boolean {
        return PushNotificationSubscriptionService.lastEndpoint && !!PushNotificationSubscriptionService.lastUser;
    }

    static subscriptionDelete(userId: string): Promise<void> {
        if (userId && this.lastEndpoint && this.lastUser) {
            return fetch('./pushRegistration', {
                method: 'delete',
                headers: {
                    'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    endpoint: this.lastEndpoint,
                    features: ['all']
                }),
            })
                .then(() => {
                    this.lastEndpoint = '';
                    this.lastUser = '';
                    return Promise.resolve();
                }, this.fetchError);
        } else {
            return Promise.reject('Not Subscribed');
        }
    }

    static subscriptionNew(userId: string): Promise<PushSubscription> {
        return this.askNotificationPermission().then(() => {
            return this.registration.then(registration => {
                return registration.pushManager.getSubscription().then((pushSubscription: PushSubscription) => {
                    return fetch('./pushRegistration', {
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            features: ['all'],
                            subscription: pushSubscription,
                        }),
                    })
                        .then((res: Response) => res.json(), this.fetchError)
                        .then(res => {
                            if (res.subscribed) {
                                return pushSubscription;
                            }
                            if (!res.applicationServerKey) {
                                return Promise.reject('');
                            }
                            if (pushSubscription) {
                                return pushSubscription.unsubscribe().then(() => {
                                    PushNotificationSubscriptionService.subscriptionNewCreate(registration, res.applicationServerKey, userId);
                                });
                            }
                            return PushNotificationSubscriptionService.subscriptionNewCreate(registration, res.applicationServerKey, userId);
                        });
                });
            });
        });
    }

    static subscriptionNewCreate(registration, applicationServerKey, userId) {
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/')
            ;
            const rawData = window.atob(base64);
            return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
        }
        return registration.pushManager.subscribe({
            applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
            userVisibleOnly: true,
        })
            .then((pushSubscription: PushSubscription) => {
                if (!pushSubscription || !pushSubscription.getKey || !pushSubscription.endpoint) {
                    return;
                }
                fetch('./pushRegistrationSubscribe', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        applicationServerKey: applicationServerKey,
                        features: ['all'],
                        subscription: pushSubscription,
                    }),
                })
                    .then(() => {
                        this.lastEndpoint = pushSubscription.endpoint;
                        this.lastUser = userId;
                    }, this.fetchError);
                return pushSubscription;
            });
    }

    static subscriptionServerUpdate(userId): Promise<void> {
        if (this.lastEndpoint) {
            return fetch('./pushRegistrationUpdate', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    endpoint: this.lastEndpoint,
                    features: ['all']
                }),
            })
                .catch(err => {
                    if (err === 'Not Found.') {
                        this.lastEndpoint = '';
                        this.lastUser = '';
                    }
                    return Promise.reject('Network Error');
                })
                .then((res: Response) => res.json(), this.fetchError)
                .then(body => {
                    if (body && body.exists === false) {
                        this.lastEndpoint = '';
                        this.lastUser = '';
                        return Promise.reject('This subscription does not exist.');
                    } else if (body && body.status === true) {
                        this.lastUser = userId;
                        return Promise.resolve();
                    } else if (body && body.status === false) {
                        this.lastUser = '';
                        return Promise.reject('This subscription does not exist.');
                    } else {
                        return Promise.reject('Network Error');
                    }
                });
        } else {
            return Promise.reject('Not Subscribed.');
        }
    }

    static updateExisting(userId: string) {
        navigator.serviceWorker.register('/sw.js')
            .then(
                registration => {
                    this.registrationResolve(registration);
                    this.subscriptionServerUpdate(userId).catch(_noop);
                },
                this.registrationReject
            );
    }
}
