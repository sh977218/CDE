import { Locator, Page } from '@playwright/test';

export class LoginRecordsAuditPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    findLatestLoginRecordByUser(username: string): Locator {
        return this.page
            .locator(`cde-login-record table tbody tr`, {
                has: this.page.locator('td', { hasText: username }),
            })
            .first()
            .locator(`td`)
            .first();
    }
}
