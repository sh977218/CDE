import { Page, Locator } from '@playwright/test';

export class FormPagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    alerts(): Locator {
        return this.page.getByTestId(`form-view-alert`);
    }

    mergeToLink(): Locator {
        return this.page.getByTestId('form-view-mergeTo-link');
    }

    formTitle(): Locator {
        return this.page.getByTestId('form-view-title');
    }
}
