import { Page } from '@playwright/test';
import { MaterialPo } from '../../shared/material.po';

export class ManageTagsPropertiesPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    orgContainer() {
        return this.page.getByTestId(`org-container`);
    }

    orgName() {
        return this.page.getByTestId(`org-name`);
    }

    orgPropertiesList() {
        return this.page.getByTestId(`org-properties-list`);
    }

    orgTagsList() {
        return this.page.getByTestId(`org-tags-list`);
    }

    async addPropertyByOrg(orgName: string, key: string) {
        const orgRow = this.orgContainer().filter({
            has: this.orgName().filter({ hasText: new RegExp(`^${orgName}$`, 'i') }),
        });
        const chipGridContainer = orgRow.locator(this.orgPropertiesList());
        await this.materialPage.matChipListInput(chipGridContainer).click();
        await this.page.keyboard.type(key);
        await this.page.keyboard.press('Enter');
        await this.materialPage.matSpinnerShowAndGone();
        await this.materialPage.checkAlert('Org Updated');
    }

    async removePropertyByOrg(orgName: string, key: string) {
        await this.page
            .getByRole('row', { name: `${orgName}`, exact: true })
            .getByRole('row', { name: `${key}` })
            .getByRole('button', { name: 'cancel' })
            .click();
        await this.materialPage.matSpinnerShowAndGone();
        await this.materialPage.checkAlert('Org Updated');
    }

    async addTagByOrg(orgName: string, key: string) {
        const orgRow = this.orgContainer().filter({
            has: this.orgName().filter({ hasText: new RegExp(`^${orgName}$`, 'i') }),
        });
        const chipGridContainer = orgRow.locator(this.orgTagsList());
        await this.materialPage.matChipListInput(chipGridContainer).click();
        await this.page.keyboard.type(key);
        await this.page.keyboard.press('Enter');
        await this.materialPage.matSpinnerShowAndGone();
        await this.materialPage.checkAlert('Org Updated');
    }

    async removeTagByOrg(orgName: string, key: string) {
        await this.page
            .getByRole('row', { name: `${orgName}`, exact: true })
            .getByRole('row', { name: `${key}` })
            .getByRole('button', { name: 'cancel' })
            .click();
        await this.materialPage.matSpinnerShowAndGone();
        await this.materialPage.checkAlert('Org Updated');
    }
}
