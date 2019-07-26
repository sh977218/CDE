import _noop from 'lodash/noop';

export class PushNotificationSubscriptionService {
    static get lastEndpoint() {
        return window.localStorage.getItem('nlmcde.push') || '';
    }
    static set lastEndpoint(endpoint: string) {
        window.localStorage.setItem('nlmcde.push', endpoint);
    }
    static get lastUser() {
        return window.localStorage.getItem('nlmcde.push1') || '';
    }
    static set lastUser(userId: string) {
        window.localStorage.setItem('nlmcde.push1', userId);
    }
    static registration = new Promise<ServiceWorkerRegistration>((resolve, reject) => {
        PushNotificationSubscriptionService.registrationResolve = resolve;
        PushNotificationSubscriptionService.registrationReject = reject;
    });
    static registrationResolve: (value?: ServiceWorkerRegistration | PromiseLike<ServiceWorkerRegistration>) => void;
    static registrationReject: (reason?: any) => void;

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
                        reject(new Error('Notification permission denied.'));
                    }
                });
            });
    }

    static async getEndpoint(): Promise<void> {
        if (!this.lastEndpoint) {
            try {
                // generate new endpoint
                const registration = await this.registration;
                const pushSubscription: PushSubscription | null = await registration.pushManager.getSubscription();
                if (pushSubscription && pushSubscription.endpoint) {
                    this.lastEndpoint = pushSubscription.endpoint;
                } else {
                    return Promise.reject('No subscription.');
                }
            } catch (e) {
                return this.fetchError(e);
            }
        }
    }

    static fetchError(error: Error): Promise<any> {
        PushNotificationSubscriptionService.handleError(error);
        if (error instanceof Error) {
            if (error.message.indexOf('denied')) {
                alert(`Your browser preferences prevent notifications from this website. (${error.message})`);
                return;
            }
            if (error.message === 'Failed to fetch' || error.message === 'Unexpected token < in JSON at position 0') {
                throw new Error('Server is not available or you are offline.');
            }
        }
        throw error;
    }

    static handleError(error: Error) {
        fetch('./server/log/clientExceptionLogs', {
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
        return !!PushNotificationSubscriptionService.lastEndpoint && !!PushNotificationSubscriptionService.lastUser;
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
            throw new Error('Not Subscribed');
        }
    }

    static async subscriptionNew(userId: string): Promise<PushSubscription | null> {
        try {
            await this.askNotificationPermission();
            const registration = await this.registration;
            const pushSubscription: PushSubscription | null = await registration.pushManager.getSubscription();
            const response: Response = await fetch('./pushRegistration', {
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
            const res = await response.json();
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

    static async subscriptionNewCreate(registration: ServiceWorkerRegistration, applicationServerKey: string, userId: string) {
        function urlBase64ToUint8Array(base64String: string) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/')
            ;
            const rawData = window.atob(base64);
            return Uint8Array.from(Array.from(rawData).map(char => char.charCodeAt(0)));
        }
        try {
            const pushSubscription: PushSubscription = await registration.pushManager.subscribe({
                applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                userVisibleOnly: true,
            });
            if (!pushSubscription || !pushSubscription.getKey || !pushSubscription.endpoint) {
                return this.fetchError(new Error('Bad syntax.'));
            }
            await fetch('./pushRegistrationSubscribe', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    applicationServerKey,
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

    static async subscriptionServerUpdate(userId: string): Promise<void> {
        if (!this.lastEndpoint) {
            throw new Error('Not Subscribed.');
        }
        let response: Response;
        try {
            response = await fetch('./pushRegistrationUpdate', {
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
        } catch (e) {
            throw new Error('Network Error');
        }
        let body;
        try {
            body = await response.json();
        } catch (e) {
            throw new Error('Network Error - not json');
        }
        if (body && body.exists === false) {
            this.lastEndpoint = '';
            this.lastUser = '';
            throw new Error('This subscription does not exist.');
        } else if (body && body.status === false) {
            this.lastUser = '';
            throw new Error('This subscription does not exist.');
        } else if (body && body.status === true) {
            this.lastUser = userId;
            return Promise.resolve();
        } else {
            throw new Error('Network Error');
        }
    }

    static async updateExisting(userId?: string) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js').catch();
            this.registrationResolve(registration);
            if (userId) {
                this.subscriptionServerUpdate(userId).catch(_noop);
            }
        } catch (err) {
            this.registrationReject();
        }
    }
}
