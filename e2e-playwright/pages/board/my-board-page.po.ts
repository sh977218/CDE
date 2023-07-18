import { Page, Locator } from '@playwright/test';

export class MyBoardPagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    boardTitle(boardTitle: string): Locator {
        return this.page.locator(`[data-testid="board-title"]`, {
            has: this.page.locator(`text=${boardTitle}`),
        });
    }
}
