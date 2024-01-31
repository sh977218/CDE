import { Page, test as baseTest, TestInfo } from '@playwright/test';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AioTocViewMenuPo } from '../pages/shared/aio-toc-view-menu.po';

import { MyBoardPagePo } from '../pages/board/my-board-page.po';
import { MaterialPo } from '../pages/shared/material.po';
import { BoardPagePo } from '../pages/board/board-page.po';
import { SearchPagePo } from '../pages/search/search-page.po';
import { SearchPreferencesPagePo } from '../pages/search-preferences-page.po';
import { InlineEditPo } from '../pages/shared/inline-edit.po';
import { NavigationMenuPo } from '../pages/shared/navigation-menu.po';

// Modals
import { SaveModalPo } from '../pages/shared/save-modal.po';
import { UpdateRegistrationStatusModalPo } from '../pages/shared/update-registration-status-modal.po';

// Create CDE/Form page
import { CreateEltPo } from '../pages/create/create-elt.po';

// CDE page
import { CdePagePo } from '../pages/cde/cde-page.po';
import { ConceptPo } from '../pages/cde/concept.po';
import { PermissibleValuePo } from '../pages/cde/permissible-value.po';

// Form page
import { FormPagePo } from '../pages/form/form-page.po';
import { PreviewPo } from '../pages/form/preview.po';
import { FormDescriptionPo } from '../pages/form/form-description.po';
import { DisplayProfilePo } from '../pages/form/display-profile.po';

// Shared sections
import { GenerateDetailsPo } from '../pages/shared/generate-details.po';
import { IdentifierPo } from '../pages/shared/identifier.po';
import { ClassificationPo } from '../pages/shared/classification.po';
import { AttachmentPo } from '../pages/shared/attachment.po';
import { HistoryPo } from '../pages/shared/history.po';

// Setting page
import { SettingMenuPo } from '../pages/setting/setting-menu.po';
import { ProfilePagePo } from '../pages/setting/profile-page.po';
import { ArticlePagePo } from '../pages/setting/article-page.po';
import { ManageOrganizationsPo } from '../pages/setting/my-organizations/manage-organizations.po';

// Manage classification page
import { ManageClassificationPo } from '../pages/manage-classifications/manage-classification.po';

// Audit page
import { ItemLogAuditPagePo } from '../pages/audit/item-log-audit-page.po';
import { AuditTabPo } from '../pages/audit/audit-tab.po';
import { LoginRecordsAuditPagePo } from '../pages/audit/login-records-audit-page.po';
import { ConsoleMessage } from 'playwright-core';

// Submission
import { SubmissionEditPo } from '../pages/submission/submissionEdit.po';
import { SubmissionManagePo } from '../pages/submission/submissionManage.po';

const PROJECT_ROOT_FOLDER = join(__dirname, '../..');
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, '.nyc_output');

async function codeCoverage(page: Page, testInfo: TestInfo) {
    const coverage: string = await page.evaluate('JSON.stringify(window.__coverage__);');
    if (coverage) {
        const name = randomBytes(32).toString('hex');
        const nycOutput = join(NYC_OUTPUT_FOLDER, `${name}`);
        await fs.writeFile(nycOutput, coverage);
    } else {
        // API testing don't output coverage
        const isDebug = testInfo.project.name === 'CDE-smokeTest';
        const isApiTesting = testInfo.titlePath.filter(t => t.includes('API') || t.includes('api')).length > 0;
        if (isDebug || isApiTesting) {
            console.info(`No coverage needed for debug or api testing: ${testInfo.titlePath.join(' -> ')}`);
        } else {
            throw new Error(`No coverage found for ${testInfo.titlePath.join(' -> ')}`);
        }
    }
}

const baseFixture = baseTest.extend<{
    cdePage: CdePagePo;
    permissibleValueSection: PermissibleValuePo;
    createEltPage: CreateEltPo;
    conceptSection: ConceptPo;
    formPage: FormPagePo;
    formDescription: FormDescriptionPo;
    previewSection: PreviewPo;
    displayProfileSection: DisplayProfilePo;
    myBoardPage: MyBoardPagePo;
    boardPage: BoardPagePo;
    saveModal: SaveModalPo;
    generateDetailsSection: GenerateDetailsPo;
    identifierSection: IdentifierPo;
    attachmentSection: AttachmentPo;
    classificationSection: ClassificationPo;
    historySection: HistoryPo;
    updateRegistrationStatusModal: UpdateRegistrationStatusModalPo;
    aioTocViewMenu: AioTocViewMenuPo;
    navigationMenu: NavigationMenuPo;
    searchPage: SearchPagePo;
    searchPreferencesPage: SearchPreferencesPagePo;
    inlineEdit: InlineEditPo;
    itemLogAuditPage: ItemLogAuditPagePo;
    auditTab: AuditTabPo;
    loginRecordAuditPage: LoginRecordsAuditPagePo;
    manageClassificationPage: ManageClassificationPo;
    manageOrganizationsPage: ManageOrganizationsPo;
    materialPage: MaterialPo;
    profilePage: ProfilePagePo;
    articlePage: ArticlePagePo;
    settingMenu: SettingMenuPo;
    submissionEditPage: SubmissionEditPo;
    submissionManagePage: SubmissionManagePo;
}>({
    page: async ({ page, baseURL }, use) => {
        await page.goto(baseURL || '/home');
        await page.getByText(`Use of CDEs Supports the NIH Data Management and Sharing Policy`).waitFor();
        await use(page);
    },
    materialPage: async ({ page }, use) => {
        await use(new MaterialPo(page));
    },
    saveModal: async ({ page, materialPage }, use) => {
        await use(new SaveModalPo(page, materialPage));
    },
    cdePage: async ({ page }, use) => {
        await use(new CdePagePo(page));
    },
    permissibleValueSection: async ({ page }, use) => {
        await use(new PermissibleValuePo(page));
    },
    createEltPage: async ({ page, materialPage }, use) => {
        await use(new CreateEltPo(page, materialPage));
    },
    conceptSection: async ({ page, materialPage, saveModal }, use) => {
        await use(new ConceptPo(page, materialPage, saveModal));
    },
    formPage: async ({ page }, use) => {
        await use(new FormPagePo(page));
    },
    formDescription: async ({ page, materialPage, inlineEdit }, use) => {
        await use(new FormDescriptionPo(page, materialPage, inlineEdit));
    },
    previewSection: async ({ page, materialPage }, use) => {
        await use(new PreviewPo(page, materialPage));
    },
    displayProfileSection: async ({ page, inlineEdit, materialPage, saveModal }, use) => {
        await use(new DisplayProfilePo(page, inlineEdit, materialPage, saveModal));
    },
    myBoardPage: async ({ page, materialPage }, use) => {
        await use(new MyBoardPagePo(page, materialPage));
    },
    boardPage: async ({ page }, use) => {
        await use(new BoardPagePo(page));
    },
    generateDetailsSection: async (
        { page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal },
        use
    ) => {
        await use(new GenerateDetailsPo(page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal));
    },
    identifierSection: async ({ page }, use) => {
        await use(new IdentifierPo(page));
    },
    classificationSection: async ({ page, materialPage, saveModal }, use) => {
        await use(new ClassificationPo(page, materialPage, saveModal));
    },
    attachmentSection: async ({ page, inlineEdit }, use) => {
        await use(new AttachmentPo(page, inlineEdit));
    },
    historySection: async ({ page, materialPage }, use) => {
        await use(new HistoryPo(page, materialPage));
    },
    updateRegistrationStatusModal: async ({ page }, use) => {
        await use(new UpdateRegistrationStatusModalPo(page));
    },
    aioTocViewMenu: async ({ page }, use) => {
        await use(new AioTocViewMenuPo(page));
    },
    navigationMenu: async ({ page, materialPage }, use) => {
        await use(new NavigationMenuPo(page, materialPage));
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPagePo(page));
    },
    searchPreferencesPage: async ({ page }, use) => {
        await use(new SearchPreferencesPagePo(page));
    },
    inlineEdit: async ({ page }, use) => {
        await use(new InlineEditPo(page));
    },
    manageClassificationPage: async ({ page, materialPage, classificationSection }, use) => {
        await use(new ManageClassificationPo(page, materialPage, classificationSection));
    },
    itemLogAuditPage: async ({ page }, use) => {
        await use(new ItemLogAuditPagePo(page));
    },
    auditTab: async ({ page }, use) => {
        await use(new AuditTabPo(page));
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
    profilePage: async ({ page }, use) => {
        await use(new ProfilePagePo(page));
    },
    articlePage: async ({ page }, use) => {
        await use(new ArticlePagePo(page));
    },
    submissionEditPage: async ({ page }, use) => {
        await use(new SubmissionEditPo(page));
    },
    submissionManagePage: async ({ page }, use) => {
        await use(new SubmissionManagePo(page));
    },
});

const ignoredConsoleMessages = [
    '[webpack-dev-server]',
    'Angular is running in development mode',
    'ExpressionChangedAfterItHasBeenCheckedError',
    '[main.js:',
    'Failed to load resource: the server responded with a status of 400',
    'Failed to load resource: the server responded with a status of 404 (Not Found)',
    'Failed to load resource: the server responded with a status of 409 (Conflict)',
    'No value accessor for form control',
    `Cannot read properties of undefined (reading '_hostElement')`,
    `Cannot read properties of undefined (reading 'removeEventListener')`,
    `Cannot read properties of null (reading 'writeValue')`,
];

const consoleMessages: string[] = [];

baseFixture.beforeEach(({ page }) => {
    page.on('console', (msg: ConsoleMessage) => {
        if (msg) {
            consoleMessages.push(msg.text());
        }
    });
});

baseFixture.afterEach(async ({ page }, testInfo) => {
    await codeCoverage(page, testInfo);
});

baseFixture.afterAll(async () => {
    for (const consoleMessage of consoleMessages) {
        const expectedConsole = ignoredConsoleMessages.find(
            ignoredConsoleMessage => consoleMessage.indexOf(ignoredConsoleMessage) !== -1
        );
        if (!expectedConsole) {
            throw new Error(`Unexpected console: ${consoleMessage}`);
        }
    }
});

export const test = baseFixture;
