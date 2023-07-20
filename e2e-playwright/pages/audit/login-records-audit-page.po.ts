import { Locator, Page } from '@playwright/test';

export class LoginRecordsAuditPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    findLoginRecordByUser(username: string): Locator {
        return this.page.locator(`tr:has-text("${username}")`);
    }
}
