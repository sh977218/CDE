import { Locator, Page } from '@playwright/test';

export class BasePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
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
