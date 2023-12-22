import { Page, expect } from '@playwright/test';

export class SnackBarPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async checkAlert(text: string) {
        const alertText = this.page
            .locator('mat-snack-bar-container')
            .locator('simple-snack-bar')
            .locator('.mat-mdc-snack-bar-label');
        await expect(alertText).toHaveText(text, { timeout: 30 * 1000 });
        await this.page.locator('mat-snack-bar-container').locator('button').click();
        await this.page.waitForSelector(`mat-snack-bar-container`, { state: 'hidden' });
    }
}
