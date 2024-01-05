import { Page } from '@playwright/test';

export class HomePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goToHome() {
        await this.page.goto('/home');
        await this.page.waitForSelector(`text=Use of CDEs Supports the NIH Data Management and Sharing Policy`, {
            state: 'visible',
        });
    }
}
