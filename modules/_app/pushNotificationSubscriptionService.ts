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

    static async getEndpoint(): Promise<void> {
        if (this.lastEndpoint) {
            return Promise.resolve();
        } else {
            try {
                // generate new endpoint
                let registration = await this.registration;
                let pushSubscription: PushSubscription = await registration.pushManager.getSubscription();
                if (pushSubscription && pushSubscription.endpoint) {
                    this.lastEndpoint = pushSubscription.endpoint;
                    return Promise.resolve();
                } else {
                    return Promise.reject('No subscription.');
                }
            } catch (e) {
                return this.fetchError(e);
            }
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

    static async subscriptionDelete(userId: string): Promise<void> {
        if (userId && this.lastEndpoint && this.lastUser) {
            try {
                await fetch('./pushRegistration', {
                    method: 'delete',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        endpoint: this.lastEndpoint,
                        features: ['all']
                    }),
                });
                this.lastEndpoint = '';
                this.lastUser = '';
                return Promise.resolve();
            } catch (e) {
                return this.fetchError(e);
            }
        } else {
            return Promise.reject('Not Subscribed');
        }
    }

    static async subscriptionNew(userId: string): Promise<PushSubscription> {
        try {
            await this.askNotificationPermission();
            let registration = await this.registration;
            let pushSubscription: PushSubscription = await registration.pushManager.getSubscription();
            let response: Response = await fetch('./pushRegistration', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    features: ['all'],
                    subscription: pushSubscription,
                }),
            });
            let res = await response.json();
            if (res.subscribed) {
                return pushSubscription;
            }
            if (!res.applicationServerKey) {
                return Promise.reject('');
            }
            if (pushSubscription) {
                await pushSubscription.unsubscribe();
                return PushNotificationSubscriptionService.subscriptionNewCreate(registration, res.applicationServerKey, userId);
            }
            return PushNotificationSubscriptionService.subscriptionNewCreate(registration, res.applicationServerKey, userId);
        } catch (e) {
            return this.fetchError(e);
        }
    }

    static async subscriptionNewCreate(registration, applicationServerKey, userId) {
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/')
            ;
            const rawData = window.atob(base64);
            return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
        }
        try {
            let pushSubscription: PushSubscription = await registration.pushManager.subscribe({
                applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                userVisibleOnly: true,
            });
            if (!pushSubscription || !pushSubscription.getKey || !pushSubscription.endpoint) {
                return;
            }
            await fetch('./pushRegistrationSubscribe', {
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
            });
            this.lastEndpoint = pushSubscription.endpoint;
            this.lastUser = userId;
            return pushSubscription;
        } catch (e) {
            return this.fetchError(e);
        }
    }

    static async subscriptionServerUpdate(userId): Promise<void> {
        if (this.lastEndpoint) {
            try {
                let response: Response = await fetch('./pushRegistrationUpdate', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        endpoint: this.lastEndpoint,
                        features: ['all']
                    }),
                });
                let body = await response.json();
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
            } catch (e) {
                if (e === 'Not Found.') {
                    this.lastEndpoint = '';
                    this.lastUser = '';
                }
                return Promise.reject('Network Error');
            }
        } else {
            return Promise.reject('Not Subscribed.');
        }
    }

    static async updateExisting(userId: string) {
        try {
            let registration = await navigator.serviceWorker.register('/sw.js');
            this.registrationResolve(registration);
            this.subscriptionServerUpdate(userId).catch(_noop);
        } catch (err) {
            this.registrationReject();
        }
    }
}