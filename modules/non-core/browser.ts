import { Cb, CbErr1, CbRet } from 'shared/models.model';

export function callbackify<T>(asyncFn: Promise<T>): (a: CbErr1<T>) => void {
    return cb => {
        asyncFn.then(value => cb(undefined, value) as any, cb as any);
    };
}

export function interruptEvent(event?: Event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
}

export function isIe() {
    const userAgent = window.navigator.userAgent;
    return /internet explorer/i.test(userAgent);
}

export function openUrl(url: string, event: Event, newTab = false) {
    interruptEvent(event);
    if (newTab) {
        window.open(url);
    } else {
        location.assign(url);
    }
}

export function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView();
    }
}

export function textTruncate(limit: number, text: string) {
    return text.length > limit - 3 ? text.substr(0, limit - 3) + '...' : text;
}
export function waitRendered(condition: CbRet<boolean>, cb: Cb, tries = 5) {
    if (tries === 0) {
        throw new Error('Timeout while waiting to render');
    }
    setTimeout(() => {
        if (!condition()) {
            waitRendered(condition, cb, tries - 1);
            return;
        }
        cb();
    }, 0);
}
