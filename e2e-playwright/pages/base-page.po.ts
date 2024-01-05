import { Locator, Page } from '@playwright/test';

export class BasePagePo {
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

    async goToSearch(module: string) {
        await this.page.goto(`/${module}/search`);
        await this.page.waitForSelector(`text=Enter a phrase/text or explore`, { state: 'visible' });
    }

    publishDraft() {
        return this.page.getByTestId(`publish-draft`);
    }

    deleteDraft() {
        return this.page.getByTestId(`delete-draft`);
    }

    getHeading(section: string): Locator {
        return this.page.getByRole('heading', { name: section });
    }
}
