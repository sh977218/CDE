import { expect, Locator, Page } from '@playwright/test';

export class MaterialPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    matMenuItem(text: string): Locator {
        return this.page.locator('//*[@role = "menuitem"][normalize-space() = "' + text + '"]');
    }

    matOption(text: string): Locator {
        return this.page.locator('//mat-option[normalize-space() = "' + text + '"]');
    }

    paginatorNext(): Locator {
        return this.page.locator('//button[contains(@class, "mat-mdc-paginator-navigation-next")]');
    }

    paginatorNumberPerPage(): Locator {
        return this.page.locator('mat-paginator mat-select');
    }

    matArrayLeft() {
        return this.page.locator(`//mat-icon[normalize-space() = 'subdirectory_arrow_left']`);
    }

    matEdit() {
        return this.page.locator(`//mat-icon[normalize-space() = 'edit']`);
    }

    matDelete() {
        return this.page.locator(`//mat-icon[normalize-space() = 'delete_outline']`);
    }

    matTransform() {
        return this.page.locator(`//mat-icon[normalize-space() = 'transform']`);
    }

    matDialog() {
        return this.page.locator(`mat-dialog-container`);
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
