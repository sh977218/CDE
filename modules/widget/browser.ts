export function interruptEvent(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
}

export function isIe() {
    let userAgent = window.navigator.userAgent;
    return /internet explorer/i.test(userAgent);
}

export function openUrl(url, event, newTab = false) {
    interruptEvent(event);
    if (newTab) {
        window.open(url);
    } else {
        location.assign(url);
    }
}

export function scrollTo(id) {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView();
}

export function textTruncate(limit, text) {
    return text.length > limit - 3
        ? text.substr(0, limit - 3) + '...'
        : text;
}

export function waitRendered(condition, cb, tries = 5) {
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
