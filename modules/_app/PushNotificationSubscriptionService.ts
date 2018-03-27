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

    static handleError(error) {
        console.log('Error: ' + error);
    }

    static fetchError(error) {
        PushNotificationSubscriptionService.handleError(error);
        if (error instanceof Error
            && (error.message === 'Failed to fetch' || error.message === 'Unexpected token < in JSON at position 0')) {
            return Promise.reject('Server is not available or you are offline.');
        }
        return Promise.reject(error);
    }

    static subscriptionCheckClient(): boolean {
        return PushNotificationSubscriptionService.lastEndpoint && !!PushNotificationSubscriptionService.lastUser;
    }

    static subscriptionNew(userId: string): Promise<PushSubscription> {
        return this.askNotificationPermission()
            .then(() => {
                return this.registration.then(registration => {
                    return registration.pushManager.getSubscription()
                        .then( (pushSubscription: PushSubscription) => {
                            if (pushSubscription) {
                                return pushSubscription;
                            }
                            return registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: new Uint8Array([4, 201, 28, 17, 156, 41, 224, 80, 45, 4,
                                    210, 133, 227, 168, 20, 49, 155, 46, 244, 5, 59, 94, 152, 185, 149, 181, 145, 253,
                                    13, 39, 131, 227, 230, 218, 228, 179, 159, 40, 194, 59, 223, 233, 4, 235, 14, 163,
                                    9, 247, 89, 163, 101, 64, 244, 122, 26, 28, 13, 116, 30, 86, 209, 56, 172, 59, 147])
                            });
                        })
                        .then((pushSubscription: PushSubscription) => {
                            if (!pushSubscription || !pushSubscription.getKey || !pushSubscription.endpoint) return;
                            fetch('./pushRegistration', {
                                method: 'post',
                                headers: {
                                    'Content-type': 'application/json'
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    subscription: pushSubscription,
                                    features: ['all']
                                }),
                            })
                                .then(() => {
                                    this.lastEndpoint = pushSubscription.endpoint;
                                    this.lastUser = userId;
                                }, this.fetchError);
                            return pushSubscription;
                        });
                });
            });
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
}
