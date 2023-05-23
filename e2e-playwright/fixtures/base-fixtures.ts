import { test as baseTest } from '@playwright/test';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AioTocViewMenuPo } from '../pages/aio-toc-view-menu.po';
import { BasePagePo } from '../pages/base-page.po';
import { HomePagePo } from '../pages/home-page.po';
import { CdePagePo } from '../pages/cde-page.po';
import { FormPagePo } from '../pages/form-page.po';
import { SearchPagePo } from '../pages/search-page.po';
import { SnackBarPo } from '../pages/snack-bar.po';
import { InlineEditPo } from '../pages/inline-edit.po';
import { NavigationMenuPo } from '../pages/navigation-menu.po';

// Modal
import { SaveModalPo } from '../pages/save-modal.po';

// Setting page
import { SettingMenuPo } from '../pages/setting/setting-menu.po';
import { ProfilePagePo } from '../pages/setting/profile-page.po';
import { ManageOrganizationsPo } from '../pages/setting/my-organizations/manage-organizations.po';

async function codeCoverage(page) {
    const coverage: string = await page.evaluate('JSON.stringify(window.__coverage__);');
    const name = randomBytes(32).toString('hex');
    if (coverage) {
        const projectRootFolder = join(__dirname, '../..');
        const nycOutput = join(projectRootFolder, `/e2e-playwright/.nyc_output/${name}.json`);
        await fs.writeFile(nycOutput, coverage);
    }
}

const test = baseTest.extend<{
    basePage: BasePagePo;
    homePage: HomePagePo;
    cdePage: CdePagePo;
    formPage: FormPagePo;
    saveModal: SaveModalPo;
    aioTocViewMenu: AioTocViewMenuPo;
    navigationMenu: NavigationMenuPo;
    searchPage: SearchPagePo;
    snackBar: SnackBarPo;
    inlineEdit: InlineEditPo;
    settingMenu: SettingMenuPo;
    profilePage: ProfilePagePo;
    manageOrganizationsPage: ManageOrganizationsPo;
}>({
    basePage: async ({ page }, use) => {
        await use(new BasePagePo(page));
        await codeCoverage(page);
    },
    homePage: async ({ page }, use) => {
        await use(new HomePagePo(page));
        await codeCoverage(page);
    },
    cdePage: async ({ page }, use) => {
        await use(new CdePagePo(page));
        await codeCoverage(page);
    },
    formPage: async ({ page }, use) => {
        await use(new FormPagePo(page));
        await codeCoverage(page);
    },
    saveModal: async ({ page }, use) => {
        await use(new SaveModalPo(page));
        await codeCoverage(page);
    },
    aioTocViewMenu: async ({ page }, use) => {
        await use(new AioTocViewMenuPo(page));
        await codeCoverage(page);
    },
    navigationMenu: async ({ page }, use) => {
        await use(new NavigationMenuPo(page));
        await codeCoverage(page);
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPagePo(page));
        await codeCoverage(page);
    },
    snackBar: async ({ page }, use) => {
        await use(new SnackBarPo(page));
        await codeCoverage(page);
    },
    inlineEdit: async ({ page }, use) => {
        await use(new InlineEditPo(page));
        await codeCoverage(page);
    },
    settingMenu: async ({ page }, use) => {
        await use(new SettingMenuPo(page));
        await codeCoverage(page);
    },
    profilePage: async ({ page }, use) => {
        await use(new ProfilePagePo(page));
        await codeCoverage(page);
    },
    manageOrganizationsPage: async ({ page }, use) => {
        await use(new ManageOrganizationsPo(page));
        await codeCoverage(page);
    },
});

export default test;
