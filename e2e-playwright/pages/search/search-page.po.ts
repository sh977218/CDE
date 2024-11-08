import { expect, Locator, Page } from '@playwright/test';
import { AdministrativeStatus, CurationStatus } from 'shared/models.model';
import { id } from '../../pages/util';
import { MaterialPo } from '../../pages/shared/material.po';
import { MyBoardPagePo } from '../../pages/board/my-board-page.po';
import { DUPLICATE_PINS, MULTIPLE_PINS, SINGLE_PIN } from '../../data/constants';

export class SearchPagePo {
    protected page: Page;
    protected materialPage: MaterialPo;
    protected myBoardPage: MyBoardPagePo;

    constructor(page: Page, materialPage: MaterialPo, myBoardPage: MyBoardPagePo) {
        this.page = page;
        this.materialPage = materialPage;
        this.myBoardPage = myBoardPage;
    }

    searchResultList() {
        return this.page.getByTestId('search-result-list');
    }

    searchResultInfoBar() {
        return this.page.getByTestId('search-result-info-bar');
    }

    searchResultNumber() {
        return id(this.page, 'searchResultNum');
    }

    organizationTitleLink() {
        return this.page.getByTestId(`browse-org`);
    }

    classificationChild(name: string) {
        return id(this.page, `classif-${name}`);
    }

    classificationFilterText() {
        return this.page.getByTestId(`classification-text`);
    }

    classificationFilterNumber() {
        return this.page.getByTestId(`classification-number`);
    }

    classificationFilter() {
        return this.page.locator(`[data-testid="classification-filter"]`);
    }

    activeFilterDateType() {
        return this.page.locator(`[data-testid="active-filter-data-type"]`);
    }

    activeFilterRegistrationStatus() {
        return this.page.locator(`[data-testid="active-filter-registration-status"]`);
    }

    administrativeStatus(status: AdministrativeStatus) {
        return id(this.page, `adminstatus-${status}`);
    }

    async browseOrganization(organization: string) {
        await this.page
            .locator(`[data-testid="browse-org"]`, {
                hasText: new RegExp(`^${organization}$`),
            })
            .click();
        await this.page.waitForSelector(`text=${organization}`);
    }

    async selectClassification(classificationName: string, numberToBeVerified?: number) {
        let selector = new RegExp(`^${classificationName}`);

        if (numberToBeVerified !== undefined) {
            selector = new RegExp(`^${classificationName} (${numberToBeVerified})`);
        }
        const orgClassificationFilter = this.classificationFilter().filter({
            hasText: selector,
        });
        await orgClassificationFilter.click();
        await this.page.waitForTimeout(5000); //@TODO find a better way to know if search result is updated.
    }

    classificationFilterByNameAndNumber(
        classificationText: string,
        classificationNumber: number | string = 0
    ): Locator {
        const classificationLocator = this.page
            .getByTestId(`classification-filter`)
            .locator('[data-testid="classification-text"]', {
                has: this.page.locator(`text="${classificationText}"`),
            });
        return classificationNumber
            ? classificationLocator.locator('[data-testid="classification-text"]', {
                  hasText: '' + classificationNumber,
              })
            : classificationLocator;
    }

    classificationFilterSelected(classificationText: string, alt: boolean = false): Locator {
        return this.page
            .getByTestId(`classification-${alt ? 'alt-' : ''}filter-selected`)
            .locator('[data-testid="classification-text"]', {
                hasText: classificationText,
            });
    }

    altClassificationFilterModeToggle(): Locator {
        return id(this.page, 'altClassificationFilterModeToggle');
    }

    copyrightStatusFilter(status: string): Locator {
        return this.page
            .locator(`[data-testid='copyright-status-filter']`, {
                hasText: status,
            })
            .locator('input');
    }

    registrationStatusFilter(status: CurationStatus) {
        return this.page.locator(`[data-testid='registration-status-filter']`, {
            hasText: status,
        });
    }

    registrationStatusFilterInput(status: CurationStatus): Locator {
        return this.registrationStatusFilter(status).locator('input');
    }

    dataTypeFilter(datatype: string): Locator {
        return this.page.locator(`[data-testid='datatype-filter']`, {
            hasText: datatype,
        });
    }

    dataTypeFilterInput(datatype: string): Locator {
        return this.dataTypeFilter(datatype).locator('input');
    }

    nihEndorsedCheckbox(): Locator {
        return this.page.getByTestId(`nihEndorsedCheckbox`);
    }

    clearAllFilters(): Locator {
        return this.page.getByTestId(`class-all-filters`);
    }

    searchQueryInput(): Locator {
        return this.page.getByTestId(`search-query-input`);
    }

    searchSubmitButton(): Locator {
        return this.page.getByTestId(`search-submit-button`);
    }

    goToElt(index: number): Locator {
        return id(this.page, `linkToElt_${index}`);
    }

    pinElement(index: number): Locator {
        return id(this.page, `pinToBoard_${index}`);
    }

    pinAll(): Locator {
        return id(this.page, 'pinAll');
    }

    pinBoardModal(): Locator {
        return this.page.getByTestId(`pinBoardLoginModal`);
    }

    pinBoardModalMessage(): Locator {
        return this.pinBoardModal().locator('ul li');
    }

    pinBoardModalButton(): Locator {
        return this.pinBoardModal().getByTestId(`pinBoardLoginBtn`);
    }

    pinBoardModalClose(): Locator {
        return this.page.getByTestId(`pinBoardCloseBtn`);
    }

    parseNumberFromFilterText(text: string) {
        return /\d+/.exec(text)?.at(0) || '';
    }

    async searchWithString(s: string, expectedNumberOfResults: null | number = null) {
        await this.searchQueryInput().fill(s);
        await this.searchSubmitButton().click();
        await this.page.waitForTimeout(5000); // @TODO find a better way to know when search result is updated.
        if (expectedNumberOfResults === null) {
            await expect(this.page.getByText('results. Sorted by relevance.')).toBeVisible({ timeout: 10 * 1000 });
        } else if (expectedNumberOfResults === 0) {
            await expect(this.page.getByText('No results were found.')).toBeVisible({ timeout: 10 * 1000 });
        } else {
            await expect(this.page.getByText(`${expectedNumberOfResults} results. Sorted by relevance.`)).toBeVisible({
                timeout: 10 * 1000,
            });
        }
    }

    async pinCdeToBoardWithModal(cdeName: string, boardName: string) {
        await this.pinTo(cdeName);
        await this.myBoardPage.selectBoardToPin(boardName);
    }

    async pinAllResultWithModal(boardName: string) {
        await this.page.getByRole('button', { name: 'Pin All' }).click();
        await this.myBoardPage.selectBoardToPin(boardName, MULTIPLE_PINS);
    }

    async pinAllCdesWithModal(boardName: string) {
        await this.page.getByRole('button', { name: 'Pin CDEs' }).click();
        await this.myBoardPage.selectBoardToPin(boardName, MULTIPLE_PINS);
    }

    async pinCdeToBoardWithoutModal(cdeName: string, boardName: string, alertMessageCode = SINGLE_PIN) {
        await this.pinTo(cdeName);
        if (alertMessageCode === SINGLE_PIN) {
            await this.materialPage.checkAlert(`Pinned to ${boardName}`);
        } else {
            await this.materialPage.checkAlert(`Already added`);
        }
    }

    private async pinTo(eltName: string) {
        await this.searchWithString(eltName, 1);
        await this.page.locator(`[id="pinToBoard_0"]`).click();
    }
}
