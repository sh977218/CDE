import { Page, Locator } from '@playwright/test';

export class BoardPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    compareButton(): Locator {
        return this.page.getByTestId('board-compare-button');
    }

    openMergeFormModalButton(position = 'left') {
        return this.page.locator(`.${position}Obj`).getByTestId(`openMergeFormModalBtn`);
    }

    mergeFormError() {
        return this.page.getByTestId(`merge-form-error`);
    }

    closeMergeFormButton() {
        return this.page.getByTestId(`close-merge-form-btn`);
    }

    retireCdeCheckbox() {
        return this.page.getByTestId(`retire-cde-checkbox`).locator(`input`);
    }

    mergeFormButton() {
        return this.page.getByTestId(`merge-form-button`);
    }

    leftQuestions() {
        return this.page.getByTestId(`left-question`);
    }
}
