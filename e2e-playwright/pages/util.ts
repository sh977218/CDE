import { Locator, Page } from '@playwright/test';

export function button(page: Page | Locator, text: string): Locator {
    return page.locator('//button[text()[normalize-space() = "' + text + '"]]');
}

export function listItem(page: Page | Locator, text: string): Locator {
    return page.locator('//mat-list-item[normalize-space() = "' + text + '"]');
}

export function tag(page: Page | Locator, tag: string, text?: string) {
    return page.locator('//' + tag + (text ? '[text()[normalize-space() = "' + text + '"]]' : ''));
}
