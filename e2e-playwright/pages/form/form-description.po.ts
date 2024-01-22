import { Locator, Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';
import { InlineEditPo } from '../shared/inline-edit.po';

export class FormDescriptionPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
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

    /**
     *
     * @param questionLocator
     * @param index zero based index, -1 to select 'No Label'
     */
    async selectQuestionLabelByIndex(questionLocatorId: string, index: number) {
        const questionLocator = this.page.locator(`#${questionLocatorId}`);
        await questionLocator.locator(`[title="Change question label"]`).click();
        await this.materialPage.matDialog().waitFor();
        if (index === -1) {
            await this.materialPage.matDialog().getByRole('button', { name: 'No Label', exact: true }).click();
        } else {
            await this.materialPage.matDialog().getByRole('button', { name: 'Select', exact: true }).nth(index).click();
        }
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
    }

    async editQuestionInstructionByIndex(questionLocatorId: string, newInstruction: string) {
        const instructionLocator = this.page.locator(`#${questionLocatorId} .editQuestionInstruction`);
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        await this.inlineEdit.editIcon(instructionLocator).click();
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        await this.inlineEdit.typeTextField(instructionLocator, newInstruction);
        await this.materialPage.checkAlert('Saved');
    }
}
