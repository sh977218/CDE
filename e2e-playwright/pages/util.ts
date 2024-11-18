import { Locator, Page } from '@playwright/test';
import { random } from 'lodash';

export function button(page: Page | Locator, text: string): Locator {
    return tag(page, 'button', text);
}

export function byClass(page: Page | Locator, c: string): Locator {
    return page.locator(`[class="${c}"]`);
}

// "has" requires a relative locator so locator() needs to be called twice with the same selector
export function has(page: Page | Locator, selector: string, hasFn: (locator: Locator) => Locator) {
    return page.locator(selector, {
        has: hasFn(page.locator(selector)),
    });
}

export function id(page: Page | Locator, id: string): Locator {
    return page.locator(`[id="${id}"]`);
}

export function listItem(page: Page | Locator, text: string): Locator {
    return page.locator('//mat-list-item[normalize-space() = "' + text + '"]');
}

export function tag(page: Page | Locator, tag: string, text?: string) {
    return page.locator('//' + tag + (text ? xpathHasText(text) : ''));
}

export function xpathHasText(text: string) {
    return '[text()[normalize-space() = "' + text + '"]]';
}

export function move(arr: string[], fromIndex: number, toIndex: number) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

export function randomGen(min: number, max: number, howMany: number) {
    return Array(howMany).fill(random(min, max));
}

export function escapeRegex(str: string) {
    return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function trimRegex(str: string) {
    return new RegExp(`^\\s*${escapeRegex(str)}\\s*$`);
}
