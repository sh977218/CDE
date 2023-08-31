import { Page } from '@playwright/test';

export class SearchPreferencesPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    searchPreferencesCheckbox() {
        return this.page.getByTestId(`include-retired`).locator('input');
    }

    saveButton() {
        return this.page.getByTestId(`save-search-preferences-button`);
    }
}
