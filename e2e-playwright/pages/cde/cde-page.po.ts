import { Locator, Page } from '@playwright/test';

export class CdePagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goToCde(tinyId: string) {
        await this.page.goto(`/deView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
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

    addToBoard() {
        return this.page.locator(`[id="addToBoard"]`);
    }
}
