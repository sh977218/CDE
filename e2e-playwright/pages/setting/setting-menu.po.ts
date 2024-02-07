import { Page } from '@playwright/test';

export class SettingMenuPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    profileMenu() {
        return this.page.getByTestId('profile');
    }

    viewingHistoryMenu() {
        return this.page.getByTestId(`viewing-history`);
    }

    manageOrganizationsMenu() {
        return this.page.getByTestId('manage-organizations');
    }

    adminsMenu() {
        return this.page.getByTestId(`admins`);
    }

    curatorsMenu() {
        return this.page.getByTestId(`curators`);
    }

    editorsMenu() {
        return this.page.getByTestId(`editors`);
    }

    usersMenu() {
        return this.page.getByTestId(`users`);
    }
}
