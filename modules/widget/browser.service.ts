export class BrowserService {
    private constructor() {}

    static interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    static isIe() {
        let userAgent = window.navigator.userAgent;
        return /internet explorer/i.test(userAgent);
    }

    static openUrl(url, event, newTab = false) {
        BrowserService.interruptEvent(event);
        if (newTab) {
            window.open(url);
        } else {
            location.assign(url);
        }
    }

    static scrollTo(id) {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView();
    }

    static waitRendered(condition, cb, tries = 5) {
        if (tries === 0) {
            throw new Error('Timeout while waiting to render');
        }
        setTimeout(() => {
            if (!condition()) {
                BrowserService.waitRendered(condition, cb, tries - 1);
                return;
            }
            cb();
        }, 0);
    }
}
