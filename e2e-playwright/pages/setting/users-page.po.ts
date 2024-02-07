import { Locator, Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';

export class UsersPagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    searchUserButton() {
        return this.page.getByTestId(`search-user-button`);
    }

    createUserButton() {
        return this.page.getByTestId(`create-user-button`);
    }

    usernameLabel() {
        return this.page.getByTestId(`username-label`);
    }

    username() {
        return this.page.getByTestId(`username`);
    }

    avatarLabel() {
        return this.page.getByTestId(`avatar-label`);
    }

    avatar() {
        return this.page.getByTestId(`avatar`);
    }

    createdLabel() {
        return this.page.getByTestId(`created-label`);
    }

    created() {
        return this.page.getByTestId(`created`);
    }

    LastLoginLabel() {
        return this.page.getByTestId(`Last-login-label`);
    }

    LastLogin() {
        return this.page.getByTestId(`Last-login`);
    }

    orgEditorLabel() {
        return this.page.getByTestId(`org-editor-label`);
    }

    orgEditor() {
        return this.page.getByTestId(`org-editor`);
    }

    orgCuratorLabel() {
        return this.page.getByTestId(`org-curator-label`);
    }

    orgCurator() {
        return this.page.getByTestId(`org-curator`);
    }

    orgAdminLabel() {
        return this.page.getByTestId(`org-admin-label`);
    }

    orgAdmin() {
        return this.page.getByTestId(`org-admin`);
    }

    siteAdminLabel() {
        return this.page.getByTestId(`site-admin-label`);
    }

    siteAdmin() {
        return this.page.getByTestId(`site-admin`);
    }

    rolesLabel() {
        return this.page.getByTestId(`roles-label`);
    }

    roles() {
        return this.page.getByTestId(`roles`);
    }

    knownIpsLabel() {
        return this.page.getByTestId(`known-ips-label`);
    }

    knownIps() {
        return this.page.getByTestId(`known-ips`);
    }

    async addRolesToUser(userContainer: Locator, roles: string[]) {
        for (const role of roles) {
            await this.materialPage.matChipListInput(userContainer).click();
            await this.materialPage.matOptionByText(role).click();
            await this.materialPage.checkAlert(`Roles saved.`);
        }
    }

    async createUserByUsername(username: string) {
        await this.createUserButton().click();
        await this.materialPage.matDialog().waitFor();
        await this.page.getByPlaceholder(`New Username`).fill(username);
        await this.materialPage.matDialog().getByRole('button', { name: 'Save' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(`User created`);
    }

    searchResultByUsername(username: string) {
        return this.page.locator(`section`, {
            has: this.username().filter({
                hasText: new RegExp(`^${username}$`, 'i'),
            }),
        });
    }
}
