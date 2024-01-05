import { Locator, Page } from '@playwright/test';

export class InlineEditPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    editIcon(locator: Locator) {
        return locator.getByTestId('inline-edit-icon');
    }

    inputField(locator: Locator) {
        return locator.getByTestId('inline-edit-input');
    }

    submitButton(locator: Locator) {
        return locator.getByTestId('inline-edit-submit');
    }
}
