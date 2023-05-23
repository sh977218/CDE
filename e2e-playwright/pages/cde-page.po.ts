import { BasePagePo } from '../pages/base-page.po';
import { Page } from '@playwright/test';

export class CdePagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToCde(tinyId) {
        await this.page.goto(`/deView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }
}
