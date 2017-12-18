export class BrowserService {
    private constructor() {}

    static interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    static isIe() {
        let userAgent = window.navigator.userAgent;
        return /internet explorer/i.test(userAgent);
    }

    static openUrl(url, event, newTab = false) {
        BrowserService.interruptEvent(event);
        if (newTab)
            window.open(url);
        else
            location.assign(url);
    };
}