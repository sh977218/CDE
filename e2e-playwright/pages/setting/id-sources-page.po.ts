import { Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';

export class IdSourcesPagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    async addIdSource(orgName: string, cdeLinkTemplate: string, formLinkTemplate: string) {
        await this.page.getByPlaceholder('New Id:').fill(orgName);
        await this.page.getByRole('button', { name: 'Add' }).click();
        await this.materialPage.checkAlert(`${orgName} added.`);

        const row = this.page
            .getByRole('row')
            .filter({ has: this.page.getByRole('cell', { name: orgName, exact: true }) });
        if (cdeLinkTemplate) {
            await row.getByPlaceholder(`Data Element Link URL: (Use {{id}} and {{version}}.)`).fill(cdeLinkTemplate);
            await this.page.keyboard.press('Enter');
            await this.materialPage.checkAlert(`${orgName} updated.`);
        }
        if (formLinkTemplate) {
            await row.getByPlaceholder(`Form Link URL: (Use {{id}} and {{version}}.)`).fill(formLinkTemplate);
            await this.page.keyboard.press('Enter');
            await this.materialPage.checkAlert(`${orgName} updated.`);
        }
    }
}
