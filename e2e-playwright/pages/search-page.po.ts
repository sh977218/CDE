import { Locator, Page } from '@playwright/test';

export class SearchPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    browseOrg(org: string): Locator {
        return this.page.locator(`[id="browseOrg-${org}"]`);
    }

    addClassificationFilter(filter: string): Locator {
        return this.page.locator(`[id="classif-${filter}"]`);
    }

    addRegStatusFilter(filter: string) {
        return this.page.locator(`[id="regstatus-${filter}"]`);
    }

    addDataTypeFilter(filter: string) {
        return this.page.locator(`[id="datatype-${filter}"]`);
    }

    altClassificationFilterModeToggle(): Locator {
        return this.page.locator(`[id="altClassificationFilterModeToggle"]`);
    }

    regStatusFilterSelected(id: string): Locator {
        return this.page.locator(`[id="regstatus-${id}"]`);
    }

    dataTypeFilterSelected(id: string): Locator {
        return this.page.locator(`[id="datatype-${id}"]`);
    }

    classificationFilterSelected(id: string, state: boolean): Locator {
        if (state)
            return this.page.locator(
                `xpath=//*[@id='classif-${id}' and (contains(@class, 'treeParent') or contains(@class, 'treeCurrent'))]`
            );
        else return this.page.locator(`xpath=//*[@id='classif-${id}' and contains(@class, 'treeChild')]`);
    }

    nihEndorsedToggle(): Locator {
        return this.page.locator(`[id="nihEndorsedCheckbox"]`);
    }

    clearAllFilters(): Locator {
        return this.page.locator(`[class="clearAllPill"]`);
    }

    findSearchPageText(text: string): Locator {
        return this.page.getByText(text);
    }
}
