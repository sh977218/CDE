import { UpdateRegistrationStatusModalPo } from '../../pages/shared/update-registration-status-modal.po';

export async function editRegistrationStatus(
    updateRegistrationStatusModal: UpdateRegistrationStatusModalPo,
    {
        status = '',
        effectiveDate = '',
        untilDate = '',
        administrativeStatus = '',
        administrativeNote = '',
        unresolvedIssue = '',
    }
) {
    if (status) {
        await updateRegistrationStatusModal.registrationStatusSelect().selectOption(status);
    }
    if (effectiveDate) {
        await updateRegistrationStatusModal.effectiveDateInput().fill(effectiveDate);
    }
    if (untilDate) {
        await updateRegistrationStatusModal.untilDateInput().fill(untilDate);
    }
    if (administrativeStatus) {
        await updateRegistrationStatusModal.administrativeStatusSelect().selectOption(administrativeStatus);
    }
    if (administrativeNote) {
        await updateRegistrationStatusModal.administrativeNoteTextarea().fill(administrativeNote);
    }
    if (unresolvedIssue) {
        await updateRegistrationStatusModal.unresolvedIssueTextarea().fill(unresolvedIssue);
    }
    await updateRegistrationStatusModal.saveRegistrationStatusButton().click();
}
