import { BasePagePo } from '../pages/base-page.po';
import { Page } from '@playwright/test';

export class CdePagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }
}
