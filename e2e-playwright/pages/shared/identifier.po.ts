import { expect, Page } from '@playwright/test';
import { Version } from '../../model/type';

export class IdentifierPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async verifyVersion(versionInfo: Version, versionBeforeSave: string = '') {
        // Saved with new version, versionBeforeSave does not matter
        if (versionInfo.newVersion) {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText(versionInfo.newVersion);
        }
        // Saved with versionBeforeSave, new version is versionBeforeSave concatenate .1
        else if (versionBeforeSave) {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText(versionBeforeSave + '.1');
        }
        // If none of version present, set it to 1. This is how test version defines, not the CDE application logic
        else {
            await expect(this.page.locator(`[itemprop="version"]`)).toHaveText('1');
        }
    }
}
