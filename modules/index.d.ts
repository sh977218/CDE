export type ObjectId = string;

declare global {
    interface Window {
        endpointUrl: string; // publishForm
        federatedLogin: string; // login
        formElt: string; // publishForm
        ga: any; // Google Analytics
        gtag: any; // Google Global Site Tag
        // frames: Dictionary<Window>; // ts lib.dom definition is wrong
        loggedIn: () => void;
        publicUrl: string;
        siteKey: string;
        ssoServerReceiver: string;
        urlProd: string;
        version: string;
    }
}
