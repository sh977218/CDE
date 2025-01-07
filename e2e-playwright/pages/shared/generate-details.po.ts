import { Locator, Page } from '@playwright/test';
import { InlineEditPo } from './inline-edit.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import {
    Copyright,
    DataType,
    DataTypeDate,
    DataTypeNumber,
    Definition,
    Designation,
    EditDefinitionConfig,
    EditDesignationConfig,
    RegistrationStatus,
} from '../../model/type';
import { MaterialPo } from './material.po';
import { SaveModalPo } from './save-modal.po';
import { SORT_DIRECTION_MAP_SORTABLE_ARRAY } from '../../data/constants';

export class GenerateDetailsPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;
    private readonly saveModal: SaveModalPo;
    private readonly updateRegistrationStatusModal: UpdateRegistrationStatusModalPo;

    constructor(
        page: Page,
        materialPage: MaterialPo,
        inlineEdit: InlineEditPo,
        saveModal: SaveModalPo,
        updateRegistrationStatusModal: UpdateRegistrationStatusModalPo
    ) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
        this.saveModal = saveModal;
        this.updateRegistrationStatusModal = updateRegistrationStatusModal;
    }

    get viewCount() {
        return this.page.getByTestId('views-count');
    }

    // copyright locators
    copyrightCheckbox() {
        return this.page.getByTestId('copyright-checkbox');
    }

    copyrightStatement() {
        return this.page.getByTestId('copyright-statement');
    }

    copyrightAuthority() {
        return this.page.getByTestId('copyright-authority');
    }

    copyrightUrlContainer() {
        return this.page.getByTestId(`copyright-container`);
    }

    copyrightUrlAdd() {
        return this.page.getByTestId('copyright-url-add');
    }

    copyrightUrlDelete() {
        return this.page.getByTestId('copyright-url-delete');
    }

    copyrightUrl() {
        return this.page.getByTestId('copyright-url');
    }

    disallowRenderingCheckbox() {
        return this.page.getByTestId(`disallowRendering-checkbox`);
    }

    disallowRenderingText() {
        return this.page.getByTestId(`disallow-rendering-text`);
    }

    createdLabel() {
        return this.page.getByTestId(`created-label`);
    }

    created() {
        return this.page.getByTestId(`created`);
    }

    createdByLabel() {
        return this.page.getByTestId(`created-by-label`);
    }

    createdBy() {
        return this.page.getByTestId(`created-by`);
    }

    updatedLabel() {
        return this.page.getByTestId(`updated-label`);
    }

    updated() {
        return this.page.getByTestId(`updated`);
    }

    updatedByLabel() {
        return this.page.getByTestId(`updated-by-label`);
    }

    updatedBy() {
        return this.page.getByTestId(`updated-by`);
    }

    registrationStatus() {
        return this.page.getByTestId(`registration-status`);
    }

    origin() {
        return this.page.getByTestId('origin');
    }

    copyright() {
        return this.page.getByTestId('copyright-checkbox');
    }

    editRegistrationStatusButton() {
        return this.page.getByTestId('edit-registration-status-button');
    }

    editOrigin = async (newOrigin: string) => {
        const originLocator = this.origin();
        await this.inlineEdit.editIcon(originLocator).click();
        await this.inlineEdit.inputField(originLocator).fill(newOrigin);
        await this.inlineEdit.confirmButton(originLocator).click();
    };

    addNameButton() {
        return this.page.getByRole('button', { name: `Add Name`, exact: true }).click();
    }

    editRegistrationStatus = async (
        {
            status,
            effectiveDate,
            untilDate,
            administrativeStatus,
            administrativeNote,
            unresolvedIssue,
        }: RegistrationStatus = {
            status: 'Incomplete',
            effectiveDate: '',
            untilDate: '',
            administrativeStatus: '',
            administrativeNote: '',
            unresolvedIssue: '',
        }
    ) => {
        await this.editRegistrationStatusButton().click();
        await this.materialPage.matDialog().waitFor();
        if (status) {
            await this.updateRegistrationStatusModal.registrationStatusSelect().selectOption(status);
        }
        if (effectiveDate) {
            await this.updateRegistrationStatusModal.effectiveDateInput().fill(effectiveDate);
        }
        if (untilDate) {
            await this.updateRegistrationStatusModal.untilDateInput().fill(untilDate);
        }
        if (administrativeStatus) {
            await this.updateRegistrationStatusModal.administrativeStatusSelect().selectOption(administrativeStatus);
        }
        if (administrativeNote) {
            await this.updateRegistrationStatusModal.administrativeNoteTextarea().fill(administrativeNote);
        }
        if (unresolvedIssue) {
            await this.updateRegistrationStatusModal.unresolvedIssueTextarea().fill(unresolvedIssue);
        }
        await this.updateRegistrationStatusModal.saveRegistrationStatusButton().click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    };

    async addName(newDesignation: Designation) {
        await this.page.getByRole('button', { name: `Add Name`, exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByPlaceholder(`Name / Designation`).fill(newDesignation.designation);
        for (const tag of newDesignation.tags) {
            await this.materialPage
                .matChipListInput(this.materialPage.matDialog().locator(`[id="newDesignationTags"]`))
                .click();
            await this.materialPage.matOptionByText(tag).click();
        }
        await this.materialPage.matDialog().getByRole('button', { name: `Save`, exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    async editDesignationByIndex(
        index: number,
        newDesignation: Designation,
        config: EditDesignationConfig = { replace: false }
    ) {
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .nth(index);
        await this.editDesignation(designationRow, newDesignation, config);
    }

    async editDesignationByName(
        name: string,
        newDesignation: Designation,
        config: EditDesignationConfig = { replace: false }
    ) {
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .filter({ hasText: name });
        await this.editDesignation(designationRow, newDesignation, config);
    }

    async deleteDesignationByIndex(index: number) {
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .nth(index);
        await designationRow.locator('[title="Delete Designation"]').click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    async deleteDesignationByName(name: string) {
        // @TODO there is problem with this selector, the text `name` could disappear after other action, i.e. click edit icon. filter will return 0 result
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .filter({ hasText: name });
        await designationRow.locator('[title="Delete Designation"]').click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    private async editDesignation(
        designationRow: Locator,
        newDesignation: Designation,
        config: EditDesignationConfig = { replace: false }
    ) {
        await this.inlineEdit.editIcon(designationRow).click();
        if (config.replace) {
            await this.inlineEdit.inputField(designationRow).fill(newDesignation.designation);
        } else {
            await this.inlineEdit.inputField(designationRow).type(newDesignation.designation);
        }

        await this.inlineEdit.confirmButton(designationRow).click();

        for (let tag of newDesignation.tags) {
            await this.materialPage.matChipListInput(designationRow).click();
            await this.materialPage.matOptionByText(tag).click();
        }
        await this.saveModal.waitForDraftSaveComplete();
    }

    async addDefinition(newDefinition: Definition) {
        await this.page.getByRole('button', { name: `Add Definition`, exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().getByPlaceholder(`Definition`).fill(newDefinition.definition);
        for (const tag of newDefinition.tags) {
            await this.materialPage
                .matChipListInput(this.materialPage.matDialog().locator(`[id="newDefinitionTags"]`))
                .click();
            await this.materialPage.matOptionByText(tag).click();
        }
        await this.materialPage.matDialog().getByRole('button', { name: `Save`, exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    async editDefinitionByIndex(
        index: number,
        newDefinition: Definition,
        config: EditDefinitionConfig = { replace: false, html: false }
    ) {
        const definitionRow = this.page
            .getByTestId(`definitions-container`)
            .getByTestId(`definition-container`)
            .nth(index);
        await this.editDefinition(definitionRow, newDefinition, config);
    }

    async editDefinitionByName(
        name: string,
        newDefinition: Definition,
        config: EditDefinitionConfig = { replace: false, html: false }
    ) {
        // @TODO there is problem with this selector, the text `name` could disappear after other action, i.e. click edit icon. filter will return 0 result
        const definitionRow = this.page
            .getByTestId(`definitions-container`)
            .locator(`[data-testid="definition-container"]`, { hasText: name });
        await this.editDefinition(definitionRow, newDefinition, config);
    }

    async deleteDefinitionByDefinition(definition: string) {
        const definitionRow = this.page
            .getByTestId(`definitions-container`)
            .locator(`[data-testid="definition-container"]`, {
                hasText: definition,
            });
        await definitionRow.locator('[title="Delete Definition"]').click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    private async editDefinition(
        definitionRow: Locator,
        newDefinition: Definition,
        config: EditDefinitionConfig = { replace: false, html: false }
    ) {
        await this.page.waitForTimeout(2000); // give 2 seconds before click edit, this wait is not a 100% sure fix.
        await this.inlineEdit.editIcon(definitionRow).click();
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        if (config.html) {
            await this.inlineEdit.richTextButton(definitionRow).click();
        }
        if (config.replace) {
            await this.inlineEdit.clearTextField(definitionRow, config.html);
        }
        await this.inlineEdit.typeTextField(definitionRow, newDefinition.definition, config.html);

        for (let tag of newDefinition.tags) {
            await this.materialPage.matChipListInput(definitionRow).click();
            await this.materialPage.matOptionByText(tag).click();
        }
        await this.saveModal.waitForDraftSaveComplete();
    }

    async editCopyright({ copyright, statement, authority, url }: Copyright) {
        if (copyright) {
            await this.copyrightCheckbox().check();

            if (statement) {
                const copyrightStatementLocator = this.copyrightStatement();
                await this.inlineEdit.editIcon(copyrightStatementLocator).click();
                await this.inlineEdit.inputField(copyrightStatementLocator).fill(statement);
                await this.inlineEdit.confirmButton(copyrightStatementLocator).click();
            }

            if (authority) {
                const copyrightAuthorityLocator = this.copyrightAuthority();
                await this.inlineEdit.editIcon(copyrightAuthorityLocator).click();
                await this.inlineEdit.inputField(copyrightAuthorityLocator).fill(authority);
                await this.inlineEdit.confirmButton(copyrightAuthorityLocator).click();
                if (url) {
                    await this.copyrightUrlAdd().click();
                    const copyrightUrlLocator = this.copyrightUrl().first();
                    await this.inlineEdit.editIcon(copyrightUrlLocator).click();
                    await this.inlineEdit.inputField(copyrightUrlLocator).fill(url);
                    await this.inlineEdit.confirmButton(copyrightUrlLocator).click();
                }
            }
        } else {
            await this.copyrightCheckbox().uncheck();
        }
    }

    async addCopyright({ url = '' }: Copyright) {
        await this.copyrightUrlAdd().click();
        const copyrightUrlLocator = this.copyrightUrl().last();
        await this.inlineEdit.editIcon(copyrightUrlLocator).click();
        await this.inlineEdit.inputField(copyrightUrlLocator).fill(url);
        await this.inlineEdit.confirmButton(copyrightUrlLocator).click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    async reorderDesignations(index: number, direction: string) {
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .nth(index);
        const moveIcon = designationRow
            .locator('cde-sortable-array')
            .getByLabel(SORT_DIRECTION_MAP_SORTABLE_ARRAY[direction]);
        await moveIcon.click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    async reorderDefinitions(index: number, direction: string) {
        const definitionRow = this.page
            .getByTestId(`definitions-container`)
            .getByTestId(`definition-container`)
            .nth(index);
        const moveIcon = definitionRow
            .locator('cde-sortable-array')
            .getByLabel(SORT_DIRECTION_MAP_SORTABLE_ARRAY[direction]);
        await moveIcon.click();
        await this.saveModal.waitForDraftSaveComplete();
    }
}
