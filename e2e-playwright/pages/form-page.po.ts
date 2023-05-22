import { BasePagePo } from '../pages/base-page.po';
import { Page } from '@playwright/test';

export class FormPagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }
}
