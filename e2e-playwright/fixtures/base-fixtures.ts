import { Page, test as baseTest } from '@playwright/test';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AioTocViewMenuPo } from '../pages/aio-toc-view-menu.po';
import { BasePagePo } from '../pages/base-page.po';
import { HomePagePo } from '../pages/home-page.po';
import { CdePagePo } from '../pages/cde-page.po';
import { FormPagePo } from '../pages/form-page.po';
import { MyBoardPagePo } from '../pages/board/my-board-page.po';
import { MaterialPo } from '../pages/material.po';
import { BoardPagePo } from '../pages/board/board-page.po';
import { SearchPagePo } from '../pages/search-page.po';
import { SearchPreferencesPagePo } from '../pages/search-preferences-page.po';
import { SnackBarPo } from '../pages/snack-bar.po';
import { InlineEditPo } from '../pages/inline-edit.po';
import { NavigationMenuPo } from '../pages/navigation-menu.po';

// Modals
import { SaveModalPo } from '../pages/save-modal.po';
import { UpdateRegistrationStatusModalPo } from '../pages/update-registration-status-modal.po';

// Setting page
import { SettingMenuPo } from '../pages/setting/setting-menu.po';
import { ProfilePagePo } from '../pages/setting/profile-page.po';
import { ManageOrganizationsPo } from '../pages/setting/my-organizations/manage-organizations.po';

// Manage classification page
import { ManageClassificationPo } from '../pages/manage-classifications/manage-classification.po';

// Audit page
import { AuditTabPo } from '../pages/audit/audit-tab.po';
import { ClassificationAuditPagePo } from '../pages/audit/classification-audit-page.po';
import { LoginRecordsAuditPagePo } from '../pages/audit/login-records-audit-page.po';
import { ConsoleMessage } from 'playwright-core';

// Submission
import { SubmissionEditPo } from '../pages/submission/submissionEdit.po';
import { SubmissionManagePo } from '../pages/submission/submissionManage.po';

async function codeCoverage(page: Page) {
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
    myBoardPage: MyBoardPagePo;
    boardPage: BoardPagePo;
    saveModal: SaveModalPo;
    updateRegistrationStatusModal: UpdateRegistrationStatusModalPo;
    aioTocViewMenu: AioTocViewMenuPo;
    navigationMenu: NavigationMenuPo;
    searchPage: SearchPagePo;
    searchPreferencesPage: SearchPreferencesPagePo;
    snackBar: SnackBarPo;
    inlineEdit: InlineEditPo;
    auditTab: AuditTabPo;
    classificationAuditPage: ClassificationAuditPagePo;
    loginRecordAuditPage: LoginRecordsAuditPagePo;
    manageClassificationPage: ManageClassificationPo;
    manageOrganizationsPage: ManageOrganizationsPo;
    materialPage: MaterialPo;
    profilePage: ProfilePagePo;
    settingMenu: SettingMenuPo;
    submissionEditPage: SubmissionEditPo;
    submissionManagePage: SubmissionManagePo;
}>({
    basePage: async ({ page }, use) => {
        await use(new BasePagePo(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePagePo(page));
    },
    cdePage: async ({ page }, use) => {
        await use(new CdePagePo(page));
    },
    formPage: async ({ page }, use) => {
        await use(new FormPagePo(page));
    },
    myBoardPage: async ({ page }, use) => {
        await use(new MyBoardPagePo(page));
    },
    boardPage: async ({ page }, use) => {
        await use(new BoardPagePo(page));
    },
    saveModal: async ({ page }, use) => {
        await use(new SaveModalPo(page));
    },
    updateRegistrationStatusModal: async ({ page }, use) => {
        await use(new UpdateRegistrationStatusModalPo(page));
    },
    aioTocViewMenu: async ({ page }, use) => {
        await use(new AioTocViewMenuPo(page));
    },
    navigationMenu: async ({ page }, use) => {
        await use(new NavigationMenuPo(page));
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPagePo(page));
    },
    searchPreferencesPage: async ({ page }, use) => {
        await use(new SearchPreferencesPagePo(page));
    },
    snackBar: async ({ page }, use) => {
        await use(new SnackBarPo(page));
    },
    inlineEdit: async ({ page }, use) => {
        await use(new InlineEditPo(page));
    },
    manageClassificationPage: async ({ page }, use) => {
        await use(new ManageClassificationPo(page));
    },
    auditTab: async ({ page }, use) => {
        await use(new AuditTabPo(page));
    },
    classificationAuditPage: async ({ page }, use) => {
        await use(new ClassificationAuditPagePo(page));
    },
    loginRecordAuditPage: async ({ page }, use) => {
        await use(new LoginRecordsAuditPagePo(page));
    },
    settingMenu: async ({ page }, use) => {
        await use(new SettingMenuPo(page));
    },
    manageOrganizationsPage: async ({ page }, use) => {
        await use(new ManageOrganizationsPo(page));
    },
    materialPage: async ({ page }, use) => {
        await use(new MaterialPo(page));
    },
    profilePage: async ({ page }, use) => {
        await use(new ProfilePagePo(page));
    },
    submissionEditPage: async ({ page }, use) => {
        await use(new SubmissionEditPo(page));
    },
    submissionManagePage: async ({ page }, use) => {
        await use(new SubmissionManagePo(page));
    },
});

const ignoredConsoleMessages = [
    'Failed to load resource: the server responded with a status of 404 (Not Found)',
    '[webpack-dev-server]',
    'Angular is running in development mode',
    'ExpressionChangedAfterItHasBeenCheckedError',
    '[main.js:',
];

const consoleMessages: string[] = [];

test.beforeEach(({ page }, testInfo) => {
    page.on('console', (msg: ConsoleMessage) => {
        if (msg) {
            consoleMessages.push(msg.text());
        }
    });
});

test.afterEach(async ({ page }) => {
    await codeCoverage(page);
});

test.afterAll(async () => {
    for (const consoleMessage of consoleMessages) {
        const expectedConsole = ignoredConsoleMessages.find(
            ignoredConsoleMessage => consoleMessage.indexOf(ignoredConsoleMessage) !== -1
        );
        if (!expectedConsole) {
            throw new Error(`Unexpected console: ${consoleMessage}`);
        }
    }
});

export default test;