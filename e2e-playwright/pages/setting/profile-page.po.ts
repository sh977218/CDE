import { Page } from '@playwright/test';

export class ProfilePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    userEmail() {
        return this.page.getByTestId('edit-user-email');
    }
}
