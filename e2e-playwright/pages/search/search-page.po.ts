import { expect, Locator, Page } from '@playwright/test';
import { AdministrativeStatus, CurationStatus } from 'shared/models.model';
import { id } from '../../../e2e-playwright/pages/util';

export class SearchPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
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
                hasText: organization,
            })
            .click();
        await this.page.waitForSelector(`text=${organization}`);
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
}
