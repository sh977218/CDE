import { BasePagePo } from '../pages/base-page.po';
import { Locator, Page } from '@playwright/test';

export class CdePagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToCde(tinyId: string) {
        await this.page.goto(`/deView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, {state: 'visible'});
    }

    cdeTitle(): Locator {
        return this.page.getByTestId('data-element-view-title');
    }

    mergeToLink(): Locator {
        return this.page.getByTestId('data-element-view-mergeTo-link');
    }

    alerts() {
        return this.page.getByTestId(`data-element-view-alert`);
    }

    permissibleValueSynonymsCheckbox(source: string) {
        return this.page.locator(`[data-testid="displayCode"]`, {
            hasText: source
        }).locator('input')
    }

    permissibleValueSynonymsTds(tableRow: Locator, source: string) {
        return tableRow.locator(`[data-testid="${source.toLowerCase()}"]`)
    }

    permissibleValueTableRows() {
        return this.page.locator(`[data-testid="pvTable"] tbody tr`);
    }
}
