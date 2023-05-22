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
            .locator('.mat-mdc-snack-bar-label')
            .innerText();
        await test.expect(alertText).toBe(text);
    }

    async dismissAlert() {
        await this.page.locator('mat-snack-bar-container').locator('button').click();
    }
}
