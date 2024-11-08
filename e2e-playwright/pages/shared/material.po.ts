import { expect, Locator, Page } from '@playwright/test';
import { escapeRegex } from '../../pages/util';

export class MaterialPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    matOverlay() {
        return this.page.locator(`.cdk-overlay-container`);
    }

    matMenuContent() {
        return this.page.locator(`.mat-mdc-menu-content`);
    }

    matMenuItem(text: string): Locator {
        return this.page.getByRole('menuitem', { name: text, exact: true });
    }

    matExpansionPanelHeader() {
        return this.page.locator(`.mat-expansion-panel-header`);
    }

    searchAutoCompleteOptions(): Locator {
        return this.page.getByTestId(`search-auto-complete-option`);
    }

    usernameAutocompleteInput() {
        return this.page.getByTestId(`search-users-input`);
    }

    usernameAutoCompleteOptions(): Locator {
        return this.page.getByTestId(`username-auto-complete-option`);
    }

    matOptions() {
        return this.page.locator(`mat-option`);
    }

    matOptionByText(text: string): Locator {
        return this.page.locator('//mat-option[normalize-space() = "' + text + '"]');
    }

    async toggleMatSlide(containerLocator: Locator, toggle: 'on' | 'off') {
        const matSlider = containerLocator.locator(`mat-slide-toggle`);
        const label = matSlider.locator('label');
        const button = matSlider.locator('button');
        const checked = await button.getAttribute(`aria-checked`);
        const needToggle = (toggle === 'on' && checked === 'false') || (toggle === 'off' && checked === 'true');
        if (needToggle) {
            await label.click();
        }
    }

    async selectMatSelect(matSelectLocator: Locator, text: string) {
        await matSelectLocator.click();
        await this.matOptionByText(text).click();
    }

    matSpinner() {
        return this.page.locator(`mat-spinner`);
    }

    async matSpinnerShowAndGone() {
        await this.matSpinner().waitFor({ state: 'visible', timeout: 20 * 1000 });
        await this.page.waitForTimeout(5000); // this line really should not be here, @TODO remove this wait.
        await this.matSpinner().waitFor({ state: 'detached', timeout: 20 * 1000 });
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

    matTooltip() {
        return this.matOverlay().locator(`.mdc-tooltip`);
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

    matDialogContent() {
        return this.page.locator('//*[@mat-dialog-content]');
    }

    async closeMatDialog() {
        await this.matDialog().getByRole('button', { name: 'Close', exact: true }).click();
        await this.matDialog().waitFor({ state: 'hidden' });
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

    matChipListInput(containerLocator: Locator) {
        return containerLocator.locator(`mat-chip-grid input`);
    }

    async addMatChipRowByName(containerLocator: Locator, name: string) {
        await this.matChipListInput(containerLocator).click();
        await this.page.keyboard.type(name);
        await this.page.keyboard.press('Enter');
    }

    async removeMatChipRowByName(containerLocator: Locator, name: string) {
        await containerLocator.getByRole('gridcell', { name: `remove ${name}` }).click();
    }

    async checkAlert(text: string) {
        const matSnackBarContainer = this.page.locator('mat-snack-bar-container');
        const alertText = matSnackBarContainer.locator('.mat-mdc-snack-bar-label.mdc-snackbar__label');
        await matSnackBarContainer.waitFor();
        await expect(alertText).toHaveText(new RegExp(`^\\s*${escapeRegex(text)}\\s*(Dismiss)?$`), {
            timeout: 60 * 1000,
        });
        await this.page.locator('mat-snack-bar-container').locator('button').click();
        await matSnackBarContainer.waitFor({ state: 'detached' });
    }

    async pinToBoard(boardName: string) {
        await this.matDialog().waitFor();
        await this.matDialog()
            .getByTestId(`board-title`)
            .filter({
                hasText: boardName,
            })
            .click();
        await this.matDialog().waitFor({ state: 'hidden' });
        await this.checkAlert(`Pinned to ${boardName}Dismiss`);
    }

    async loadDefaultTableViewSettings() {
        await this.page.locator('#list_gridView').click();
        await this.page.locator('#tableViewSettings').click();
        await this.matDialog().waitFor();
        await this.page.locator('#loadDefaultTableViewSettingsBtn').click();
        await this.checkAlert('Default settings loaded. Click Close to save your settings.');
        await this.page.locator('#closeTableViewSettingsBtn').click();
        await this.matDialog().waitFor({ state: 'hidden' });
    }

    async loadTableViewSettingsForExport() {
        await this.page.locator('#list_gridView').click();
        const waitForIdSourceApiPromise = this.page.waitForResponse('/server/system/idSources');
        await this.page.locator('#tableViewSettings').click();
        await this.matDialog().waitFor();
        await waitForIdSourceApiPromise;
        await this.page.locator('#uom').click();
        await this.page.locator('#naming').click();
        await this.page.locator('#administrativeStatus').click();
        await this.page.locator('#source').click();
        await this.page.locator('#updated').click();
        await this.page.locator(`//*[@id='identifiers']//input`).click();
        await this.matDialog().locator(`#identifiers`).click();
        await this.matOptionByText(`NINDS Variable Name`).click();
        await this.page.locator('#closeTableViewSettingsBtn').click();
        await this.matDialog().waitFor({ state: 'hidden' });
    }

    /**
     * Description - Expand the mat tree according to the input, and return the leaf node
     * @param classificationsArray - Classification array contains the text from root to leaf (branch)
     */
    async expandClassificationAndReturnLeafNode(classificationsArray: string[]) {
        if (!classificationsArray.length) {
            throw new Error(`manage classification expandOrgClassification classification array cannot be empty.`);
        }
        let treeNodeLocator: any;
        for (const classification of classificationsArray) {
            treeNodeLocator = this.page.locator(`mat-tree-node`, {
                has: this.page.locator(`[data-testid="tree-node-text"]`, {
                    has: this.page.locator(`text="${classification}"`),
                }),
            });
            await new Promise<void>(resolve => {
                const togglerLocator = treeNodeLocator.getByTestId(`tree-node-toggler`);
                togglerLocator
                    .waitFor({ timeout: 5000 })
                    .then(async () => {
                        await togglerLocator.click();
                    })
                    .catch(() => {})
                    .finally(() => {
                        resolve();
                    });
            });
        }
        if (!treeNodeLocator) {
            throw new Error(`manage classification expandOrgClassification classification cannot find leaf node.`);
        }
        return treeNodeLocator;
    }

    /**
     *
     * @param orgName steward org
     * @param categories classification array excludes org
     */
    async classifyItemByOrgAndCategories(orgName: string, categories: string[]) {
        await this.matDialog().waitFor();
        await this.matDialog().locator(`[id="selectOrgMatSelect"]`).click();
        await this.matOptionByText(orgName).click();
        const leafNode = await this.expandClassificationAndReturnLeafNode(categories);
        await leafNode.getByRole('button', { name: 'Classify' }).click();
        await this.matDialog().waitFor({ state: 'hidden' });
    }
}
