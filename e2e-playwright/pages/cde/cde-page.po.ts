import { Locator, Page } from '@playwright/test';

export class CdePagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
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

    outOfDateAlert() {
        return this.page.getByTestId(`data-element-view-out-of-date-warning`);
    }
    bundleInfo() {
        return this.page.getByTestId(`data-element-view-bundle-info`);
    }

    addToBoard() {
        return this.page.locator(`[id="addToBoard"]`);
    }
}
