import { Page } from '@playwright/test';

export class SearchPreferencesPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    searchPreferencesCheckbox() {
        return this.page.getByTestId(`include-retired`).locator('input');
    }

    downloadAsFile() {
        return this.page.getByLabel('File');
    }

    downloadAsTab() {
        return this.page.getByLabel('New Tab');
    }

    saveButton() {
        return this.page.getByTestId(`save-search-preferences-button`);
    }
}
