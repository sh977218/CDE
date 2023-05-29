import { Locator, Page } from '@playwright/test';

export class ClassificationAuditPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page
    }

    classificationAuditByTitle(title: string): Locator {
        return this.page.locator(`[data-testid="classification-audit-record"]`, {
            has: this.page.locator(`[data-testid="classification-audit-title"]`, {
                has: this.page.locator(`text=${title}`)
            })
        })
    }

    async openClassificationAudit(locator: Locator) {
        await locator.click();
        await locator.locator(`.mat-expansion-panel-content`)
            .getByTestId(`classification-audit-description`).waitFor({
                state: 'attached'
            })
    }

    async closeClassificationAuditByTitle(locator: Locator) {
        await locator.getByTestId(`classification-audit-header`).click();
        await this.page.waitForSelector(`.mat-expansion-panel-content`, {state: 'hidden'})
    }

    classificationAuditDescriptionByTitle(locator: Locator): Promise<string> {
        return locator.getByTestId(`classification-audit-description`).innerText();
    }


}
