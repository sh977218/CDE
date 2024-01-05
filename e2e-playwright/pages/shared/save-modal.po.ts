import { Page } from '@playwright/test';

export class SaveModalPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async newVersion(version?: string) {
        if (!version) {
            const existingVersion = await this.page.getByTestId(`new-version-input`).innerText();
            if (existingVersion.trim().length) {
                version = existingVersion + '.1';
            } else {
                version = '1';
            }
        }
        await this.page.getByTestId(`new-version-input`).fill(version);
        await this.page.getByTestId(`save-modal`).click();
    }
}
