import { Page, Locator } from '@playwright/test';

export class BoardPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    compareButton(): Locator {
        return this.page.getByTestId('board-compare-button');
    }

    closeCompareModalButton() {
        return this.page.locator(`[id="closeCompareSideBySideBtn"]`);
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

    eltSelectCheckbox() {
        return this.page.getByTestId(`elt-compare-checkbox`);
    }

    compareLeftContainer() {
        return this.page.locator(`[data-testid="compare-left-container"]`);
    }

    compareRightContainer() {
        return this.page.locator(`[data-testid="compare-right-container"]`);
    }

    fullMatchContainer() {
        return this.page.locator(`[data-testid="full-match"]`);
    }

    partialMatchContainer() {
        return this.page.locator(`[data-testid="partial-match"]`);
    }

    notMatchContainer() {
        return this.page.locator(`[data-testid="not-match"]`);
    }
}
