export interface PushSubscriptionJson {
    endpoint: string;
    expirationTime: string | null; // null - does not expire or not supported
    keys: {
        auth: string;
        p256dh: string;
    };
}

type PushRegistrationCreateRequest = { features: string[], subscription: PushSubscriptionJson | null };
type PushRegistrationCreateResponse = { applicationServerKey: string, subscribed: false } | { subscribed: true };
type PushRegistrationDeleteRequest = { endpoint: string, features: string[] };
type PushRegistrationSubscribeRequest = { applicationServerKey: string, features: string[], subscription: PushSubscriptionJson };
type PushRegistrationSubscribeResponse = string[];
type PushRegistrationUpdateRequest = { endpoint: string, features: string[] };
type PushRegistrationUpdateResponse = { status: boolean };
