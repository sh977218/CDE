import { Page } from '@playwright/test';
import { InlineEditPo } from './inline-edit.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';

export class GenerateDetailsPo {
    private readonly page: Page;
    private readonly inlineEdit: InlineEditPo;
    private readonly updateRegistrationStatusModal: UpdateRegistrationStatusModalPo;

    constructor(page: Page, inlineEdit: InlineEditPo, updateRegistrationStatusModal: UpdateRegistrationStatusModalPo) {
        this.page = page;
        this.inlineEdit = inlineEdit;
        this.updateRegistrationStatusModal = updateRegistrationStatusModal;
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
        await this.inlineEdit.submitButton(originLocator).click();
    };

    editRegistrationStatus = async ({
        status = '',
        effectiveDate = '',
        untilDate = '',
        administrativeStatus = '',
        administrativeNote = '',
        unresolvedIssue = '',
    }) => {
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
    };
}
