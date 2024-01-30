import { Locator, Page } from '@playwright/test';

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

    organizationTitleLink() {
        return this.page.getByTestId(`browse-org`);
    }

    classificationFilterText() {
        return this.page.getByTestId(`classification-text`);
    }

    async browseOrganization(organization: string) {
        await this.page
            .locator(`[data-testid="browse-org"]`, {
                has: this.page.locator(`text=${organization}`),
            })
            .click();
        await this.page.waitForSelector(`text=${organization}`);
    }

    classificationFilter(classificationText: string, classificationNumber: number | string = 0): Locator {
        const classificationLocator = this.page
            .getByTestId(`classification-filter`)
            .locator('[data-testid="classification-text"]', {
                has: this.page.locator(`text="${classificationText}"`),
            });
        return classificationNumber
            ? classificationLocator.locator('[data-testid="classification-text"]', {
                  has: this.page.locator(`text="${'' + classificationNumber}"`),
              })
            : classificationLocator;
    }

    classificationFilterSelected(classificationText: string, alt: boolean = false): Locator {
        return this.page
            .getByTestId(`classification-${alt ? 'alt-' : ''}filter-selected`)
            .locator('[data-testid="classification-text"]', {
                has: this.page.locator(`text="${classificationText}"`),
            });
    }

    altClassificationFilterModeToggle(): Locator {
        return this.page.locator(`[id="altClassificationFilterModeToggle"]`);
    }

    registrationStatusFilter(status: string): Locator {
        return this.page
            .locator(`[data-testid='registration-status-filter']`, {
                has: this.page.locator(`text=${status}`),
            })
            .locator('input');
    }

    dataTypeFilter(datatype: string): Locator {
        return this.page
            .locator(`[data-testid='datatype-filter']`, {
                has: this.page.locator(`text=${datatype}`),
            })
            .locator('input');
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
        return this.page.locator(`[id="linkToElt_${index}"]`);
    }

    pinElement(index: number): Locator {
        return this.page.locator(`[id="pinToBoard_${index}"]`);
    }

    pinAll(): Locator {
        return this.page.locator(`[id="pinAll"]`);
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
}
