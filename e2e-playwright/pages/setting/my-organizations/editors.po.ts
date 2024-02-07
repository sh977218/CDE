import { Page } from '@playwright/test';
import { MaterialPo } from '../../shared/material.po';

export class EditorsPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    addOrgEditorUserOrgSelect() {
        return this.page.getByTestId(`add-editor-user-org-select`);
    }

    makeOrgEditorButton() {
        return this.page.getByTestId(`make-editor-button`);
    }

    orgName() {
        return this.page.getByTestId(`org-name`);
    }

    orgEditorUsername() {
        return this.page.getByTestId(`org-editor-username`);
    }

    removeOrgEditorButton() {
        return this.page.getByTestId(`remove-org-editor-button`);
    }

    async addOrgEditorByUsername(username: string, orgs: string[]) {
        await this.materialPage.usernameAutocompleteInput().fill(username);
        await this.materialPage.matOptionByText(username.toLowerCase()).click();
        for (const org of orgs) {
            await this.addOrgEditorUserOrgSelect().selectOption(org);
            await this.makeOrgEditorButton().click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Saved');
        }
    }

    async removeOrgEditorByUsername(username: string, orgs: string[]) {
        for (const org of orgs) {
            await this.page
                .locator('tr', {
                    has: this.orgName().filter({ hasText: new RegExp(`^${org}$`, 'i') }),
                })
                .locator('td div')
                .filter({
                    has: this.orgEditorUsername().filter({
                        hasText: new RegExp(`^${username}$`, 'i'),
                    }),
                })
                .locator(this.removeOrgEditorButton())
                .click();
            await this.materialPage.matSpinnerShowAndGone();
            await this.materialPage.checkAlert('Removed');
        }
    }
}
