import { Page } from '@playwright/test';

export class ArticlePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    articleKeySelection() {
        return this.page.getByTestId('article-key-selection');
    }

    shutdownToggle(){
        return this.page.getByTestId('shutdown-toggle')
    }
}
