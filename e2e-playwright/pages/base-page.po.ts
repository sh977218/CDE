import { Locator, Page } from '@playwright/test';

export class BasePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getHeading(section: string): Locator {
        return this.page.getByRole('heading', { name: section });
    }
}
