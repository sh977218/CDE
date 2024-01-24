import { Page } from '@playwright/test';

export class ItemLogAuditPagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expandLogRecordByName(recordName: string) {
        const auditLogRow = this.page
            .locator(`cde-item-log table tbody tr`, {
                has: this.page.locator(`td`, {
                    hasText: recordName,
                }),
            })
            .first();
        await auditLogRow.getByRole('button').click();
    }
}
