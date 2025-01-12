import { expect, Locator, Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';
import { InlineEditPo } from '../shared/inline-edit.po';
import { ReorderDirection } from '../../model/type';
import { SearchPagePo } from '../../pages/search/search-page.po';

export class FormDescriptionPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;
    private readonly searchPage: SearchPagePo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo, searchPage: SearchPagePo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
        this.searchPage = searchPage;
    }

    backToPreviewButton() {
        return this.page.getByRole('button', { name: 'Back to Preview' });
    }

    warningAlertDiv() {
        return this.page.getByTestId('form-description-warning-alert-div');
    }

    warningAlertMessage() {
        return this.page.getByTestId('form-description-warning-alert-message');
    }

    questionUsedBySkipLogicAlertMessage() {
        return this.page.getByTestId('question-used-by-skip-logic-alert-message');
    }

    addQuestionButton() {
        return this.page.getByTestId(`add-question-button`);
    }

    addSectionButton() {
        return this.page.getByTestId(`add-section-button`);
    }

    addFormButton() {
        return this.page.getByTestId(`add-form-button`);
    }

    questionContainer(id: string) {
        return this.page.locator(`#${id}`);
    }

    questionLabel() {
        return this.page.getByTestId(`question-label`);
    }

    sectionTitle() {
        return this.page.getByTestId(`section-title`);
    }

    sectionTitleSubform() {
        return this.page.getByTestId(`section-title-subform`);
    }

    questionRule() {
        return this.page.getByTestId(`question-rule`);
    }

    questionPartOf() {
        return this.page.getByTestId(`question-part-of`);
    }

    sectionDiv() {
        return this.page.locator('cde-form-description-section');
    }

    questionDiv() {
        return this.page.locator('cde-form-description-question');
    }

    sectionLabelEdit() {
        return this.page.getByTestId(`section-label-edit`);
    }

    repeatEdit() {
        return this.page.getByTestId(`repeat-edit`);
    }

    logic() {
        return this.page.getByTestId(`logic`);
    }

    logicEditButton() {
        return this.page.getByTestId(`edit-logic`);
    }

    answerListEditButton() {
        return this.page.getByTestId(`edit-answer-list`);
    }

    questionDatatype() {
        return this.page.locator(`.questionDataType`);
    }

    questionAnswerList() {
        return this.page.locator(`.answerList .badge`);
    }

    questionLabelById(id: string) {
        return this.questionContainer(id).locator(this.questionLabel());
    }

    questionDataTypeById(id: string) {
        return this.questionContainer(id).locator(this.questionDatatype());
    }

    questionAnswerListById(id: string) {
        return this.questionContainer(id).locator(this.questionAnswerList());
    }

    async startEditQuestionById(id: string) {
        await this.questionLabelById(id).click();
    }

    async startEditQuestionByLabel(label: string) {
        await this.questionLabel().filter({ hasText: label }).click();
    }

    async startEditSubformByLabel(label: string) {
        await this.sectionTitleSubform().filter({ hasText: label }).click();
    }

    async saveEditQuestionById(id: string) {
        await this.questionLabelById(id).click();
    }

    /**
     * This method requires section to be toggled to edit first
     * @param title
     */
    async editSectionLabel(title: string) {
        await this.inlineEdit.editInlineEdit(this.sectionLabelEdit(), title);
        await this.materialPage.checkAlert(`Saved`);
        await this.page.waitForTimeout(3000); // @TODO something wrong with draft. Alert does not mean it's updated successfully.
    }

    async editSectionLabelById(sectionLocatorId: string, newLabel: string) {
        const sectionLabelLocator = this.page.locator(`#${sectionLocatorId} .section_label`);
        await this.inlineEdit.editInlineEdit(sectionLabelLocator, newLabel);
        await this.materialPage.checkAlert('Saved');
        await this.page.waitForTimeout(3000); // @TODO something wrong with draft. Alert does not mean it's updated successfully.
    }

    /**
     * This method requires section to be toggled to edit first
     * @param repeat
     */
    async editSectionRepeat(repeat: number | string = 0) {
        if (repeat) {
            const repeatLocator = this.repeatEdit();
            if (repeat === 'F') {
                await this.materialPage.selectMatSelect(repeatLocator, 'Over first question');
            } else if (repeat === '=') {
                await this.materialPage.selectMatSelect(repeatLocator, 'Over answer of specified question');
            } else {
                await this.materialPage.selectMatSelect(repeatLocator, 'Set Number of Times');
                await this.materialPage.checkAlert(`Saved`);
                await this.page.getByTitle('Repeat Maximum Times').fill(repeat + '');
                await this.page.keyboard.press('Tab');
            }
            await this.materialPage.checkAlert(`Saved`);
        }
    }

    async addSection(title: string, repeat: number | string = 0) {
        let dropLocator = this.page.locator(`tree-node-drop-slot`).first();
        await this.addSectionButton().dragTo(dropLocator);
        await this.sectionTitle().first().click();
        await this.materialPage.checkAlert(`Saved`);
        await this.editSectionLabel(title);
        await this.editSectionRepeat(repeat);
    }

    async addSectionBottom(title: string, repeat: number | string = 0) {
        let dropLocator = this.page.locator(`tree-node-drop-slot`).last();
        await this.addSectionButton().dragTo(dropLocator);
        await this.sectionTitle().last().click();
        await this.materialPage.checkAlert(`Saved`);
        await this.editSectionLabel(title);
        await this.editSectionRepeat(repeat);
    }

    async addQuestionToSection(cdeName: string, sectionIndex = 0) {
        const dropLocator = this.sectionDiv().nth(sectionIndex);
        await this.addQuestionButton().dragTo(dropLocator);
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByTestId(`search-query-input`).fill(cdeName);
        await this.materialPage.matDialog().getByTestId(`search-submit-button`).click();
        await this.materialPage
            .matDialog()
            .locator("(//*[@id='accordionList']//div[@class='card-header']//button)[1]")
            .click();
        await this.materialPage.checkAlert(`Saved`);
        await this.materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
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
    async selectQuestionLabelByIndex(questionLocatorId: string, index: number, usedBySkipLogic = false) {
        const questionLocator = this.page.locator(`#${questionLocatorId}`);
        await questionLocator.locator(`[title="Change question label"]`).click();
        await this.materialPage.matDialog().waitFor();
        if (usedBySkipLogic) {
            await this.questionUsedBySkipLogicAlertMessage().waitFor();
        }
        if (index === -1) {
            await this.materialPage.matDialog().getByRole('button', { name: 'No Label', exact: true }).click();
        } else {
            await this.materialPage.matDialog().getByRole('button', { name: 'Select', exact: true }).nth(index).click();
        }
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
        if (index === -1) {
            await expect(
                questionLocator
                    .locator('cde-form-description-question-detail')
                    .locator('dl')
                    .first()
                    .locator('dd')
                    .first()
            ).toContainText(`(No Label)`);
        }
    }

    async editQuestionInstructionByIndex(questionLocatorId: string, newInstruction: string) {
        const instructionLocator = this.page.locator(`#${questionLocatorId} .editQuestionInstruction`);
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        await this.inlineEdit.editIcon(instructionLocator).click();
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        await this.inlineEdit.typeTextField(instructionLocator, newInstruction);
        await this.materialPage.checkAlert('Saved');
    }

    async addEmptyQuestionLogic(questions: string[]) {
        const matDialog = this.materialPage.matDialog();
        await this.logicEditButton().click();
        await matDialog.waitFor();
        for (const [i, question] of questions.entries()) {
            await matDialog.getByRole('button', { name: 'Add Condition' }).click();
            await matDialog.getByPlaceholder('Question Label').nth(i).selectOption(question);
        }
        await matDialog.getByRole('button', { name: 'Save' }).click();
        await matDialog.waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
    }

    async addQuestionLogic(label: string, operator: string, answer: string, answerType: string) {
        const matDialog = this.materialPage.matDialog();
        await this.logicEditButton().click();
        await matDialog.waitFor();
        await matDialog.getByRole('button', { name: 'Add Condition' }).click();
        await matDialog.getByPlaceholder('Question Label').selectOption(label);
        await matDialog.getByPlaceholder('Operator').selectOption(operator);
        if (answerType.toLowerCase() === 'text') {
            await matDialog.getByPlaceholder('Text Answer').fill(answer);
        } else if (answerType.toLowerCase() === 'number') {
            await matDialog.getByPlaceholder('Number Value').fill(answer);
        } else if (answerType.toLowerCase() === 'date') {
            await matDialog.getByPlaceholder('Date').fill(answer);
        } else if (answerType.toLowerCase() === 'value list') {
            await matDialog.getByPlaceholder('Answer').selectOption(answer);
        }
        await matDialog.getByRole('button', { name: 'Save' }).click();
        await matDialog.waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
    }

    async reorderAnswerListByIndex(questionLocatorId: string, index: number, direction: ReorderDirection) {
        await this.page
            .locator(`//*[@id='${questionLocatorId}']//*[contains(@class,'answerListLabel')]//mat-icon`)
            .click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage
            .matDialog()
            .locator('table tbody tr')
            .nth(index)
            .getByRole('button', {
                name: direction,
                exact: true,
            })
            .click();
        await this.materialPage.matDialog().getByRole('button', { name: 'Save' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
    }

    async deleteAnswerListByIndex(questionLocatorId: string, answersToBeDeleted: string[]) {
        const questionContainerLocator = this.page.locator(`#${questionLocatorId}`);
        for (const answerToBeDeleted of answersToBeDeleted) {
            await this.materialPage.removeMatChipRowByName(questionContainerLocator, answerToBeDeleted);
            await this.materialPage.checkAlert('Saved');
        }
    }

    async deleteAllAnswerListByIndex() {
        const matDialog = this.materialPage.matDialog();
        await this.answerListEditButton().click();
        await matDialog.waitFor();
        await matDialog.getByRole('button', { name: 'Clear All' }).click();
        await matDialog.waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert('Saved');
    }

    /**
     *
     * @param subformName - Subform name to be searched
     * @param dropSlotIndex - drop slot index where subform to be dropped to
     */
    async addSubformByNameBeforeId(subformName: string, dropSlotIndex: number) {
        const dropLocator = this.page.locator(`tree-node-drop-slot`).nth(dropSlotIndex);
        await this.addFormButton().dragTo(dropLocator);
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().locator(this.searchPage.searchQueryInput()).fill(`"${subformName}"`);
        await this.materialPage.matDialog().locator(this.searchPage.searchSubmitButton()).click();
        await this.materialPage.matDialog().getByRole('button', { name: 'Add', exact: true }).click();
        await this.materialPage.checkAlert(`Saved`);
        await this.materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }

    /**
     *
     * @param cdeName - CDE name to be searched or created
     * @param questionId - Question id where CDE to be dropped before
     */
    async addQuestionByNameBeforeId(cdeName: string, questionId: string) {
        const dropLocator = this.page.locator(`//*[@id='${questionId}']//tree-node-drop-slot[1]`);
        await this.addQuestionButton().dragTo(dropLocator);
        await this.materialPage.matDialog().waitFor();
        await this.page.locator(`#addNewCdeBtn`).click();
        await this.page.getByPlaceholder(`New Data Element Name`).fill(cdeName);
        await this.page.locator(`#createNewDataElement`).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(`Saved`);
    }

    async addQuestionByNameBeforeIdSuggested(cdeName: string, questionId: string) {
        const dropLocator = this.page.locator(`//*[@id='${questionId}']//tree-node-drop-slot[1]`);
        await this.addQuestionButton().dragTo(dropLocator);
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().locator(this.searchPage.searchQueryInput()).fill(cdeName);
        await this.materialPage.matDialog().locator(this.searchPage.searchSubmitButton()).click();
        await this.materialPage
            .matDialog()
            .locator("(//*[@id='accordionList']//div[@class='card-header']//button)[1]")
            .click();
        await this.materialPage.checkAlert(`Saved`);
        await this.materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
    }

    /**
     * This method create CDE by name using keyboard shortcut "q"
     * @param cdeName - CDE name to be searched
     */
    async addQuestionByNameHotKey(cdeName: string) {
        await this.page.keyboard.press('q');
        await this.materialPage.matDialog().waitFor();
        await this.page.waitForTimeout(3000);
        await this.page.keyboard.type(cdeName);
        await this.page.keyboard.press('Enter');
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(`Saved`);
    }

    async addQuestionByNameHotKeySuggested(cdeName: string) {
        await this.page.keyboard.press('q');
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByRole('button', { name: 'Search Data Elements' }).click();
        await this.materialPage.matDialog().getByTestId(`search-query-input`).fill(cdeName);
        await this.materialPage.matDialog().getByTestId(`search-submit-button`).click();
        await this.materialPage
            .matDialog()
            .locator("(//*[@id='accordionList']//div[@class='card-header']//button)[1]")
            .click();
        await this.materialPage.checkAlert(`Saved`);
        await this.materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
    }

    async addQuestionByNamesHotKeySuggested(cdeNames: string[]) {
        await this.page.keyboard.press('q');
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByRole('button', { name: 'Search Data Elements' }).click();
        for (const cdeName of cdeNames) {
            await this.materialPage.matDialog().getByTestId(`search-query-input`).fill(cdeName);
            await this.materialPage.matDialog().getByTestId(`search-submit-button`).click();
            await this.materialPage
                .matDialog()
                .locator("(//*[@id='accordionList']//div[@class='card-header']//button)[1]")
                .click();
            await this.materialPage.checkAlert(`Saved`);
        }
        await this.materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
        await this.materialPage.matDialog().waitFor({ state: 'detached' });
    }

    async addNewDesignationByQuestionId(questionId: string, newDesignation: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdeDesignations')]`;
        await this.materialPage.addMatChipRowByName(this.page.locator(xpath), newDesignation);
        await this.materialPage.checkAlert(`Saved`);
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }

    async addNewIdentifierByQuestionId(questionId: string, newSource: string, newIdentifier: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdeIdentifiers')]`;
        await this.materialPage.addMatChipRowByName(this.page.locator(xpath), `${newSource};${newIdentifier}`);
        await this.materialPage.checkAlert(`Saved`);
    }

    async editCdeDataTypeById(questionId: string, dataType: string) {
        await this.materialPage.selectMatSelect(this.page.locator(`//*[@id='${questionId}']//mat-select`), dataType);
        await this.materialPage.checkAlert(`Saved`);
    }

    async deleteCdeNameById(questionId: string, designation: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdeDesignations')]`;
        await this.materialPage.removeMatChipRowByName(this.page.locator(xpath), designation);
        await this.materialPage.checkAlert(`Saved`);
    }

    async deleteCdeIdentifierById(questionId: string, source: string, id: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdeIdentifiers')]`;
        await this.materialPage.removeMatChipRowByName(this.page.locator(xpath), `${source} ${id}`);
        await this.materialPage.checkAlert(`Saved`);
    }

    async addCdePvById(questionId: string, pv: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdePvs')]`;
        await this.materialPage.addMatChipRowByName(this.page.locator(xpath), pv);
        await this.materialPage.checkAlert(`Saved`);
    }

    async deleteCdePvById(questionId: string, pv: string) {
        const xpath = `//*[@id='${questionId}']//mat-card//*[contains(@class,'newCdePvs')]`;
        await this.materialPage.removeMatChipRowByName(this.page.locator(xpath), pv);
        await this.materialPage.checkAlert(`Saved`);
    }

    async updateQuestionOrSubform(containerLocator: Locator) {
        const matDialog = this.materialPage.matDialog();
        await containerLocator.getByRole('button', { name: 'Update' }).click();
        await matDialog.waitFor();
        await matDialog.getByRole('heading', { name: 'Confirm Changes:' }).waitFor();
        await matDialog.getByRole('button', { name: 'OK' }).click();
        await matDialog.waitFor({ state: 'hidden' });
        await this.materialPage.checkAlert(`Saved`);
    }
}
