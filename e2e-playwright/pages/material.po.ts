import { Locator, Page } from '@playwright/test';

export class MaterialPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    matMenuItem(text: string): Locator {
        return this.page.locator('//*[@role = "menuitem"][normalize-space() = "' + text + '"]');
    }

    matOption(text: string): Locator {
        return this.page.locator('//mat-option[normalize-space() = "' + text + '"]');
    }

    paginatorNext(): Locator {
        return this.page.locator('//button[contains(@class, "mat-mdc-paginator-navigation-next")]');
    }

    paginatorNumberPerPage(): Locator {
        return this.page.locator('mat-paginator mat-select');
    }
}
