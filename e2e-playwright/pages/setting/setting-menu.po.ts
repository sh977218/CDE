import { Page } from '@playwright/test';

export class SettingMenuPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    profileMenu() {
        return this.page.getByTestId('profile');
    }

    manageOrganizationsMenu() {
        return this.page.getByTestId('manage-organizations');
    }
}
