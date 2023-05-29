import { Locator, Page } from '@playwright/test';

export class SearchPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
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
}
