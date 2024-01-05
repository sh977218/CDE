import { Locator, Page } from '@playwright/test';

export class LoginRecordsAuditPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    findLatestLoginRecordByUser(username: string): Locator {
        return this.page.locator(`tr:has-text("${username}")`).first().locator(`td`).last();
    }
}
