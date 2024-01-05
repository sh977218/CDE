import { BasePagePo } from '../base-page.po';
import { Page, Locator } from '@playwright/test';

export class FormPagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToForm(tinyId: string) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }

    alerts(): Locator {
        return this.page.getByTestId(`form-view-alert`);
    }

    disallowRenderingText() {
        return this.page.getByTestId(`disallow-rendering-text`);
    }

    mergeToLink(): Locator {
        return this.page.getByTestId('form-view-mergeTo-link');
    }

    formTitle(): Locator {
        return this.page.getByTestId('form-view-title');
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

    disallowRenderingCheckbox() {
        return this.page.getByTestId(`disallowRendering-checkbox`);
    }
    /* Generate Details */
}
