import { Page } from '@playwright/test';
import { MaterialPo } from '../../shared/material.po';

export class CuratorsPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    addOrgCuratorUserOrgSelect() {
        return this.page.getByTestId(`add-org-curator-user-org-select`);
    }

    orgName() {
        return this.page.getByTestId(`org-name`);
    }

    orgCuratorUsername() {
        return this.page.getByTestId(`org-curator-username`);
    }

    removeOrgCuratorButton() {
        return this.page.getByTestId(`remove-org-curator-button`);
    }

    makeOrgCuratorButton() {
        return this.page.getByTestId(`make-org-curator-button`);
    }

    async addOrgCuratorByUsername(username: string, orgs: string[]) {
        await this.materialPage.usernameAutocompleteInput().fill(username);
        await this.materialPage.matOptionByText(username.toLowerCase()).click();
        for (const org of orgs) {
            await this.addOrgCuratorUserOrgSelect().selectOption(org);
            await this.makeOrgCuratorButton().click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Saved');
        }
    }

    async removeOrgCuratorByUsername(username: string, orgs: string[]) {
        for (const org of orgs) {
            await this.page
                .locator('tr', {
                    has: this.orgName().filter({ hasText: new RegExp(`^${org}$`, 'i') }),
                })
                .locator('td div')
                .filter({
                    has: this.orgCuratorUsername().filter({
                        hasText: new RegExp(`^${username}$`, 'i'),
                    }),
                })
                .locator(this.removeOrgCuratorButton())
                .click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Removed');
        }
    }
}
