import { Page } from '@playwright/test';

export class UpdateRegistrationStatusModalPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    helperMessage() {
        return this.page.getByTestId(`helper-message`);
    }

    registrationStatusSelect() {
        return this.page.getByTestId(`registration-status-select`);
    }

    registrationStatusOptions() {
        return this.registrationStatusSelect().locator(`option`);
    }

    effectiveDateInput() {
        return this.page.getByTestId(`effective-date-input`);
    }

    untilDateInput() {
        return this.page.getByTestId(`until-date-input`);
    }

    administrativeStatusSelect() {
        return this.page.getByTestId(`administrative-status-select`);
    }

    administrativeNoteTextarea() {
        return this.page.getByTestId(`administrative-note-textarea`);
    }

    unresolvedIssueTextarea() {
        return this.page.getByTestId(`unresolved-issue-textarea`);
    }

    saveRegistrationStatusButton() {
        return this.page.getByTestId(`save-registration-status-button`);
    }

    cancelRegistrationStatusButton() {
        return this.page.getByTestId(`cancel-registration-status-button`);
    }
}
