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

    getSideBySideXpath(side: string, section: string, type: string, index: number) {
        if (side === 'left') side = 'Left';
        if (side === 'right') side = 'Right';

        if (section === 'steward') section = 'Steward';
        if (section === 'status') section = 'Status';
        if (section === 'designation') section = 'Designation';
        if (section === 'definition') section = 'Definition';
        if (section === 'identifiers') section = 'Identifiers';
        if (section === 'Related Documents') section = 'Reference Documents';
        if (section === 'properties') section = 'Properties';
        if (section === 'data element concept') section = 'Data Element Concept';
        if (section === 'questions') section = 'Questions';

        if (type === 'fullmatch') type = 'fullMatch';
        if (type === 'partialmatch') type = 'partialMatch';
        if (type === 'notmatch') type = 'notMatch';
        return (
            "(//*[@id='" +
            section +
            "']//*[contains(@class,'no" +
            side +
            "Padding')]//*[contains(@class,'" +
            type +
            "')])[" +
            index +
            ']'
        );
    }
}
