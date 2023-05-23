import { BasePagePo } from '../pages/base-page.po';
import { Page } from '@playwright/test';

export class FormPagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToForm(tinyId) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }

    /* Generate Details */
    copyrightCheckbox() {
        return this.page.getByTestId('copyright-checkbox');
    }

    copyrightStatement() {
        return this.page.getByTestId('copyright-statement');
    }

    copyrightAuthority() {
        return this.page.getByTestId('copyright-authority');
    }

    copyrightUrlAdd() {
        return this.page.getByTestId('copyright-url-add');
    }

    copyrightUrl() {
        return this.page.getByTestId('copyright-url');
    }

    /* Generate Details */
}
