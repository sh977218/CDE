import { Page } from '@playwright/test';

export class ArticlePagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    articleKeySelection() {
        return this.page.getByTestId('article-key-selection');
    }

    shutdownToggle() {
        return this.page.getByTestId('shutdown-toggle');
    }
}
