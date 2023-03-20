import { BasePagePo } from '../../pages/base-page.po';
import { expect, Page } from '@playwright/test';

export class SubmissionEditPo extends BasePagePo {
    xmlTableRow = '//';

    constructor(page: Page) {
        super(page);
    }

    isEdit() {
        expect(this.page.url().includes('?_id=')).toBeTruthy();
    }

    async isNameAndVersion(name: string, version: string) {
        await expect(this.page.getByPlaceholder('Ex. Topic Collection 1')).toHaveValue(name);
        await expect(this.page.getByPlaceholder('Ex. 1.A')).toHaveValue(version);
    }

    isNew() {
        expect(this.page.url().endsWith('/collection/edit')).toBeTruthy();
    }

    isView() {
        expect(this.page.url().endsWith('/collection')).toBeTruthy();
    }
}
