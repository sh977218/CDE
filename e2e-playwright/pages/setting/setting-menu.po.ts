import { Page } from '@playwright/test';

export class SettingMenuPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    profileMenu() {
        return this.page.getByTestId('profile');
    }

    searchSettingsMenu() {
        return this.page.getByTestId(`search-settings`);
    }

    viewingHistoryMenu() {
        return this.page.getByTestId(`viewing-history`);
    }

    manageOrganizationsMenu() {
        return this.page.getByTestId('manage-organizations');
    }

    manageProperties() {
        return this.page.getByTestId('manage-properties');
    }
    stewardTransfer() {
        return this.page.getByTestId('steward-transfer');
    }

    manageTags() {
        return this.page.getByTestId('manage-tags');
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

    articlesMenu() {
        return this.page.getByTestId(`articles`);
    }

    spellCheckMenu() {
        return this.page.getByTestId(`spell-check`);
    }

    siteAdminMenu() {
        return this.page.getByTestId('site-admins');
    }

    serverStatusMenu() {
        return this.page.getByTestId(`server-status`);
    }

    idSourcesMenu() {
        return this.page.getByTestId('id-sources');
    }
}
