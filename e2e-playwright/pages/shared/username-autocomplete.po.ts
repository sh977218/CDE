import { Page } from '@playwright/test';

export class UsernameAutocompletePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    goToHistory() {
        return this.page.getByText('History').click();
    }

    goToAttachments() {
        return this.page.locator(`[title="Attachments"]`).click();
    }
}
