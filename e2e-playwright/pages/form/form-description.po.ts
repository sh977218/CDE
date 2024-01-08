import { Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';

export class FormDescriptionPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    async startEditQuestionById(id: string) {
        await this.page.locator(`//*[@id='${id}']//*[contains(@class,'questionLabel')]`).click();
    }

    async saveEditQuestionById(id: string) {
        await this.page.locator(`//*[@id='${id}']//*[contains(@class,'questionLabel')]`).click();
    }

    async saveFormEdit() {
        await this.page.locator(`//button[contains(.,'Back to Preview')]`).click();
    }

    async questionEditAddUom(id: string, type: string, text: string) {
        const questionLocator = this.page.locator(`//*[@id='${id}']//*[contains(@class,'questionUom')]`);
        await questionLocator.locator(`input`).click();
        await questionLocator.locator(`select`).selectOption(type);
        await questionLocator.locator(`input`).fill(text);

        if (type === `UCUM`) {
            const searchUomInput = this.page.locator(`[name="searchUomInput"]`);
            await searchUomInput.click();
            await searchUomInput.clear();
            await searchUomInput.fill(text);
            await this.page
                .locator(`//*[contains(@id,'mat-autocomplete-')]//mat-option[contains(.,'${text}')]`)
                .click();
        } else {
            await this.page
                .locator(`//*[@id='${id}']//*[contains(@class,'questionUom')]//mat-icon[normalize-space() = 'add']`)
                .click();
        }
        await this.materialPage.checkAlert('Saved');
    }
}
