import { Page } from '@playwright/test';
import { MaterialPo } from '../../pages/shared/material.po';

export class SearchSettingPagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    viewPublishRadioButton() {
        return this.page.locator('id=viewPublishOnlyButton-input').locator('input');
    }

    viewPublishAndDraftRadioButton() {
        return this.page.locator('id=viewPublishAndDraftButton').locator('input');
    }

    async setViewPublishOnly() {
        await this.viewPublishRadioButton().check();
        await this.materialPage.checkAlert('Saved');
    }

    async setViewPublishAndDraft() {
        await this.viewPublishAndDraftRadioButton().check();
        await this.materialPage.checkAlert('Saved');
    }
}
