import { Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';

export class PreviewPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    previewDiv() {
        return this.page.locator(`[id="preview-div"]`);
    }

    editFormDescriptionButton() {
        return this.previewDiv().getByRole('button', { name: 'Edit', exact: true });
    }

    displayProfileSelect() {
        return this.page.getByTestId('display_profile_select');
    }

    selectDisplayProfileByName = async (profileName: string) => {
        await this.displayProfileSelect().click();
        await this.materialPage.matMenuItem(profileName).click();
    };
}
