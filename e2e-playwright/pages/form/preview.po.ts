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

    formEmptyCdeMessage() {
        return this.previewDiv().getByTestId('form-empty-cde-message');
    }

    formRenderDiv() {
        return this.previewDiv().locator('cde-native-render');
    }

    geoLocator() {
        return this.previewDiv().getByTitle('Fill in with current location');
    }

    questionDiv() {
        return this.previewDiv().locator('cde-native-question');
    }

    questionLabel() {
        return this.previewDiv().getByTestId('native-question-label');
    }

    labelClause() {
        return this.previewDiv().getByTestId('label-clause');
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

    async goToFormDescription() {
        await this.page.getByRole('heading', { name: 'Preview' }).waitFor();
        await this.editFormDescriptionButton().click();
    }

    async togglePrintView() {
        await this.previewDiv().getByRole('button', { name: 'Options' }).click();
        await this.materialPage.matMenuItem('Print View:').click();
        await this.materialPage.matOverlay().waitFor({ state: 'hidden' });
    }

    async printableView() {
        await this.previewDiv().getByRole('button', { name: 'Options' }).click();
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.materialPage.matMenuItem('Printable').click(),
        ]);
        return newPage;
    }
    async lformView() {
        await this.previewDiv().getByRole('button', { name: 'Options' }).click();
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.materialPage.matMenuItem('LHC-Forms (Provided by LHNCBC)').click(),
        ]);
        return newPage;
    }
}
