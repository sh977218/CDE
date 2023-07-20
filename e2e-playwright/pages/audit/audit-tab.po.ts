import { Locator, Page } from '@playwright/test';

export class AuditTabPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    classificationAudit(): Locator {
        return this.page.locator(`[role="tab"]`, {
            has: this.page.locator(`.mdc-tab__content`, {
                has: this.page.locator(`text=Classification Audit Log`),
            }),
        });
    }

    loginRecordsAudit(): Locator {
        return this.page.locator('[role="tab"]:has-text("Login Records")');
    }
}
