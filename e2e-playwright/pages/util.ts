import { Locator, Page } from '@playwright/test';

export function button(page: Page | Locator, text: string): Locator {
    return page.locator('//button[text()[normalize-space() = "' + text + '"]]');
}
