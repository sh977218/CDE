import { Page } from '@playwright/test';

export class SubmissionInformationPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    sourceContainer() {
        return this.page.locator(`cde-admin-item-sources fieldset`);
    }
}