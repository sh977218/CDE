import { Page, expect } from '@playwright/test';
import { MaterialPo } from './material.po';

export class SaveModalPo {
    protected page: Page;
    readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    newVersionInput() {
        return this.page.getByTestId(`new-version-input`);
    }

    publishDraftButton() {
        return this.page.getByTestId(`publish-draft`);
    }

    deleteDraftButton() {
        return this.page.getByTestId(`delete-draft`);
    }

    saveButton() {
        return this.page.getByTestId(`save-modal`);
    }

    async waitForDraftSaveComplete() {
        const viewChangeButton = this.page.locator(`#viewChangesBtn`);
        await viewChangeButton.waitFor();
        await expect(viewChangeButton).toHaveText('Changed');
    }

    async deleteDraft() {
        await this.deleteDraftButton().click();
        await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
        // This wait is needed for delete and reload the element. Ideally it should have some UI indicates that
        await this.page.waitForTimeout(2000);
    }

    async newVersion(version: string, alertMessage: string) {
        await this.page.getByTestId(`publish-draft`).click();
        await this.materialPage.matDialog().waitFor({ state: 'visible' });
        if (!version) {
            const existingVersion = await this.page.getByTestId(`new-version-input`).inputValue();
            if (existingVersion.trim().length) {
                version = existingVersion + '.1';
            } else {
                version = '1';
            }
        }
        await this.newVersionInput().fill(version);
        await this.saveButton().click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(alertMessage);
    }
}
