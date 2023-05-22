import { Page } from '@playwright/test';

export class HomePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}
