import { expect, Page } from '@playwright/test';

export class SubmissionEditPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
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
