import { Page } from '@playwright/test';
import { InlineEditPo } from './inline-edit.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { Definition, Designation, EditDefinitionConfig, EditDesignationConfig } from '../../model/type';
import { MaterialPo } from './material.po';
import { SaveModalPo } from './save-modal.po';

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

    registrationStatusLabel() {
        return this.page.getByTestId(`registration-status-label`);
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

    editRegistrationStatus = async ({
        status = '',
        effectiveDate = '',
        untilDate = '',
        administrativeStatus = '',
        administrativeNote = '',
        unresolvedIssue = '',
    }) => {
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
    };

    async editNameByIndex(
        index: number,
        newDesignation: Designation,
        config: EditDesignationConfig = { replace: false }
    ) {
        const designationRow = this.page
            .getByTestId(`designations-container`)
            .getByTestId(`designation-container`)
            .nth(index);
        await this.inlineEdit.editIcon(designationRow).click();
        if (config.replace) {
            await this.inlineEdit.inputField(designationRow).fill(newDesignation.designation);
        }
        await this.inlineEdit.inputField(designationRow).type(newDesignation.designation);

        await this.inlineEdit.confirmButton(designationRow).click();

        for (let tag of newDesignation.tags) {
            await this.materialPage.matChipListInput(designationRow).click();
            await this.materialPage.matOptionByText(tag).click();
        }
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
}
