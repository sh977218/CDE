import { BasePagePo } from '../pages/base-page.po';
import { Page } from '@playwright/test';

export class FormPage extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToForm(tinyId) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        return this.page.getByText('ON THIS PAGE').isVisible();
    }

    get navMenu() {
        return this.page.locator(`aio-toc`)
    }

}
