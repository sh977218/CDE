import { Page } from '@playwright/test';
import { MaterialPo } from '../../shared/material.po';

export class AdminsPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    addOrgAdminUserOrgSelect() {
        return this.page.getByTestId(`add-org-admin-user-org-select`);
    }

    makeOrgAdminButton() {
        return this.page.getByTestId(`make-org-admin-button`);
    }

    orgName() {
        return this.page.getByTestId(`org-name`);
    }

    orgAdminUsername() {
        return this.page.getByTestId(`org-admin-username`);
    }

    removeOrgAdminButton() {
        return this.page.getByTestId(`remove-org-admin-button`);
    }

    async addOrgAdminByUsername(username: string, orgs: string[]) {
        await this.materialPage.usernameAutocompleteInput().fill(username);
        await this.materialPage.matOptionByText(username.toLowerCase()).click();
        for (const org of orgs) {
            await this.addOrgAdminUserOrgSelect().selectOption(org);
            await this.makeOrgAdminButton().click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Saved');
        }
    }

    async removeOrgAdminByUsername(username: string, orgs: string[]) {
        for (const org of orgs) {
            await this.page
                .locator('tr', {
                    has: this.orgName().filter({ hasText: new RegExp(`^${org}$`, 'i') }),
                })
                .locator('td div')
                .filter({
                    has: this.orgAdminUsername().filter({
                        hasText: new RegExp(`^${username}$`, 'i'),
                    }),
                })
                .locator(this.removeOrgAdminButton())
                .click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Removed');
        }
    }
}
