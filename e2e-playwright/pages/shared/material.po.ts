import { expect, Locator, Page } from '@playwright/test';

export class MaterialPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    matMenuItem(text: string): Locator {
        return this.page.getByRole('menuitem', { name: text, exact: true });
    }

    matOption(text: string): Locator {
        return this.page.locator('//mat-option[normalize-space() = "' + text + '"]');
    }

    matSpinner() {
        return this.page.locator(`mat-spinner`);
    }

    matSortHeader(title: string) {
        return this.page.locator('.mat-sort-header .mat-sort-header-container', {
            has: this.page.locator(`.mat-sort-header-content`, {
                hasText: new RegExp(`^${title}$`),
            }),
        });
    }

    private matSortedHeaderContainer() {
        return this.page.locator(`.mat-sort-header-container`, {
            has: this.page.locator(`.mat-sort-header-arrow[style="transform: translateY(0px); opacity: 1;"]`),
        });
    }

    matSortedHeader() {
        return this.matSortedHeaderContainer().locator('.mat-sort-header-content');
    }

    async matSortedIndicator() {
        const style = await this.matSortedHeaderContainer()
            .locator(`.mat-sort-header-arrow .mat-sort-header-indicator`)
            .getAttribute('style');
        const arrowUp = 'transform: translateY(0px);';
        const arrowDown = 'transform: translateY(10px);';
        if (style === arrowUp) {
            return 'asc';
        } else if (style === arrowDown) {
            return 'desc';
        } else {
            throw new Error(`Unexpect mat sort indicator.`);
        }
    }

    paginatorNext(): Locator {
        return this.page.locator('//button[contains(@class, "mat-mdc-paginator-navigation-next")]');
    }

    paginatorNumberPerPage(): Locator {
        return this.page.locator('mat-paginator mat-select');
    }

    paginatorRangeLabel() {
        return this.page.locator(`.mat-mdc-paginator-range-label`);
    }

    matArrayLeft() {
        return this.page.locator(`//mat-icon[normalize-space() = 'subdirectory_arrow_left']`);
    }

    matEdit() {
        return this.page.locator(`//mat-icon[normalize-space() = 'edit']`);
    }

    matDelete() {
        return this.page.locator(`//mat-icon[normalize-space() = 'delete_outline']`);
    }

    matTransform() {
        return this.page.locator(`//mat-icon[normalize-space() = 'transform']`);
    }

    matDialog() {
        return this.page.locator(`mat-dialog-container`);
    }

    matDatePicker(datePickerToggleLocator: Locator) {
        return datePickerToggleLocator.getByRole(`button`);
    }

    matDatePickerSelectDay(day: number) {
        return this.page
            .locator(`mat-month-view table tbody tr`)
            .getByRole('gridcell')
            .getByRole('button')
            .locator(`span`, {
                has: this.page.locator(`text="${day}"`),
            });
    }

    async checkAlert(text: string) {
        const alertText = this.page
            .locator('mat-snack-bar-container')
            .locator('simple-snack-bar')
            .locator('.mat-mdc-snack-bar-label');
        await expect(alertText).toHaveText(text, { timeout: 30 * 1000 });
        await this.page.locator('mat-snack-bar-container').locator('button').click();
        await this.page.waitForSelector(`mat-snack-bar-container`, { state: 'hidden' });
    }
}
