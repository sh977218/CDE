import { Page, expect } from '@playwright/test';
import { MaterialPo } from './material.po';
import { AlertType, Version } from '../../model/type';

export class SaveModalPo {
    protected page: Page;
    readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    newVersionInput() {
        return this.materialPage.matDialog().getByTestId(`new-version-input`);
    }

    newChangeNoteTextarea() {
        return this.materialPage.matDialog().getByTestId(`new-change-note-textarea`);
    }

    overrideVersionCheckbox() {
        return this.materialPage.matDialog().locator(`id=overrideVersion`);
    }

    publishDraftButton() {
        return this.page.getByTestId(`publish-draft`);
    }

    deleteDraftButton() {
        return this.page.getByTestId(`delete-draft`);
    }

    saveButton() {
        return this.materialPage.matDialog().getByTestId(`save-modal`);
    }

    async waitForDraftSaveComplete() {
        const viewChangeButton = this.page.locator(`#viewChangesBtn`);
        await viewChangeButton.waitFor();
        await this.page.waitForLoadState('networkidle');
        await expect(viewChangeButton).toHaveText('Changed');
    }

    async deleteDraft() {
        await this.deleteDraftButton().click();
        await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
        // This wait is needed for delete and reload the element. Ideally it should have some UI indicates that
        await this.page.waitForTimeout(2000);
    }

    /**
     * @description This method publish the draft and update with version information.
     * @param alertMessage - snack message to check during save
     * @param version - optional versioning information, but highly recommended to provide
     */
    async newVersion(alertMessage: AlertType, version?: Version) {
        if (!version) version = { newVersion: '', changeNote: '' };
        // To not override input parameter 'version', make a copy
        let newVersion = version.newVersion;
        await this.page.getByTestId(`publish-draft`).click();
        await this.materialPage.matDialog().waitFor();
        if (!newVersion) {
            const existingVersion = await this.newVersionInput().inputValue();
            if (existingVersion.trim().length) {
                newVersion = existingVersion + '.1';
            } else {
                newVersion = '1';
            }
        }
        if (version.changeNote) {
            await this.newChangeNoteTextarea().fill(version.changeNote);
        }
        await this.newVersionInput().fill(newVersion);
        await this.saveButton().click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(alertMessage);
    }

    async newVersionByType(type: 'cde' | 'form', version?: Version) {
        if (type.toLowerCase() === 'cde') {
            await this.newVersion('Data Element saved.', version);
        } else if (type.toLowerCase() === 'form') {
            await this.newVersion('Form saved.', version);
        } else {
            throw new Error(`Unexpected type ${type}`);
        }
    }
}
