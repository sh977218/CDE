import { Page } from '@playwright/test';
import test from '../fixtures/base-fixtures';

export class SnackBarPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async checkAlert(text: string) {
        const alertText = await this.page
            .locator('mat-snack-bar-container')
            .locator('simple-snack-bar')
            .locator('.mat-mdc-snack-bar-label');
        await test.expect(alertText).toHaveText(text);
        await this.page.locator('mat-snack-bar-container').locator('button').click();
        await this.page.waitForSelector(`mat-snack-bar-container`, { state: 'hidden' });
    }
}
