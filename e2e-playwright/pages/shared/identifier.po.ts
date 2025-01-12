import { expect, Page } from '@playwright/test';
import { Identifier, Version } from '../../model/type';
import { MaterialPo } from './material.po';
import { SaveModalPo } from '../../pages/shared/save-modal.po';

export class IdentifierPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly saveModal: SaveModalPo;

    constructor(page: Page, materialPage: MaterialPo, saveModal: SaveModalPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.saveModal = saveModal;
    }

    identifierDiv() {
        return this.page.locator('cde-identifiers');
    }

    identifierTable() {
        return this.identifierDiv().getByRole('table');
    }

    addIdentifierButton() {
        return this.page.getByRole('button', { name: 'Add Identifier' });
    }

    async verifyVersion(versionInfo: Version, versionBeforeSave: string = '') {
        // Saved with new version, versionBeforeSave does not matter
        if (versionInfo.newVersion) {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText(versionInfo.newVersion);
        }
        // Saved with versionBeforeSave, new version is versionBeforeSave concatenate .1
        else if (versionBeforeSave) {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText(versionBeforeSave + '.1');
        }
        // If none of version present, set it to 1. This is how test version defines, not the CDE application logic
        else {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText('1');
        }
    }

    async addIdentifier({ source, id, version }: Identifier) {
        await this.addIdentifierButton().click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByTestId('new-source').selectOption(source);
        await this.materialPage.matDialog().getByPlaceholder(`Identifier`).fill(id);
        if (version) {
            await this.materialPage.matDialog().getByPlaceholder(`Version`).fill(version);
        }
        await this.materialPage.matDialog().getByRole('button', { name: 'Save' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    /**
     * @description Remove identifier by index row, starting from 1, because index 0 is tinyId which cannot be removed.
     * @param index - Start from 1
     */
    async removeIdentifierByIndex(index: number) {
        if (index === 0) {
            throw new Error('You cannot remove tinyId.');
        }
        await this.page
            .locator(`cde-identifiers table tbody tr`)
            .nth(index)
            .getByTestId('remove-identifier-button')
            .click();
    }
}
