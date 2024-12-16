import { Page, test as baseTest, TestInfo } from '@playwright/test';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AioTocViewMenuPo } from '../pages/shared/aio-toc-view-menu.po';

/**     Common page object shared between many places
 *      MaterialPo represents all material components
 *      InlineEditPo presents Inline edit input, textarea and select components
 *      usernameAutocomponentPo represents Username autocomponent
 */
import { MaterialPo } from '../pages/shared/material.po';
import { UsernameAutocompletePo } from '../pages/shared/username-autocomplete.po';
import { InlineEditPo } from '../pages/shared/inline-edit.po';

// Navigation menu
import { NavigationMenuPo } from '../pages/shared/navigation-menu.po';

// Modals
import { SaveModalPo } from '../pages/shared/save-modal.po';
import { UpdateRegistrationStatusModalPo } from '../pages/shared/update-registration-status-modal.po';

// Create CDE/Form page
import { CreateEltPo } from '../pages/create/create-elt.po';

// Search page
import { SearchPagePo } from '../pages/search/search-page.po';
import { SearchPreferencesPagePo } from '../pages/search-preferences-page.po';

// CDE page
import { CdePagePo } from '../pages/cde/cde-page.po';
import { ConceptPo } from '../pages/cde/concept.po';
import { PermissibleValuePo } from '../pages/cde/permissible-value.po';

// Form page
import { FormPagePo } from '../pages/form/form-page.po';
import { PreviewPo } from '../pages/form/preview.po';
import { FormDescriptionPo } from '../pages/form/form-description.po';
import { DisplayProfilePo } from '../pages/form/display-profile.po';

// Board page
import { MyBoardPagePo } from '../pages/board/my-board-page.po';
import { BoardPagePo } from '../pages/board/board-page.po';

// Shared sections
import { GenerateDetailsPo } from '../pages/shared/generate-details.po';
import { IdentifierPo } from '../pages/shared/identifier.po';
import { RelatedDocumentPo } from '../pages/shared/related-document.po';
import { SubmissionInformationPo } from '../pages/shared/submission-information.po';
import { PropertyPo } from '../pages/shared/property.po';
import { ClassificationPo } from '../pages/shared/classification.po';
import { AttachmentPo } from '../pages/shared/attachment.po';
import { HistoryPo } from '../pages/shared/history.po';

// Setting page
import { SettingMenuPo } from '../pages/setting/setting-menu.po';
import { ProfilePagePo } from '../pages/setting/profile-page.po';
import { AdminsPo } from '../pages/setting/my-organizations/admins.po';
import { CuratorsPo } from '../pages/setting/my-organizations/curators.po';
import { EditorsPo } from '../pages/setting/my-organizations/editors.po';
import { ManageOrganizationsPo } from '../pages/setting/my-organizations/manage-organizations.po';
import { ManageTagsPropertiesPo } from '../pages/setting/my-organizations/manage-tags-properties.po';
import { UsersPagePo } from '../pages/setting/users-page.po';
import { IdSourcesPagePo } from '../pages/setting/id-sources-page.po';
import { ArticlePagePo } from '../pages/setting/article-page.po';

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
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, 'nyc_output');

async function codeCoverage(page: Page, testInfo: TestInfo) {
    const coverage: string = await page.evaluate('JSON.stringify(window.__coverage__);');
    if (coverage) {
        const name = randomBytes(32).toString('hex');
        const nycOutput = join(NYC_OUTPUT_FOLDER, `${name}`);
        await fs.writeFile(nycOutput, coverage);
    } else {
        // API testing don't output coverage
        const isDebug = ['CDE-smokeTest', 'CDE-oneTest'].includes(testInfo.project.name);
        const isApiTesting = testInfo.titlePath.filter(t => t.includes('API') || t.includes('api')).length > 0;
        if (isDebug || isApiTesting) {
            console.info(`No coverage needed for debug or api testing: ${testInfo.titlePath.join(' -> ')}`);
        } else {
            throw new Error(`No coverage found for ${testInfo.titlePath.join(' -> ')}`);
        }
    }
}

const baseFixture = baseTest.extend<{
    materialPage: MaterialPo;
    usernameAutocomplete: UsernameAutocompletePo;
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
    relatedDocumentSection: RelatedDocumentPo;
    submissionInformationSection: SubmissionInformationPo;
    propertySection: PropertyPo;
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
    adminsPage: AdminsPo;
    curatorsPage: CuratorsPo;
    editorsPage: EditorsPo;
    manageOrganizationsPage: ManageOrganizationsPo;
    manageTagsPropertiesPage: ManageTagsPropertiesPo;
    profilePage: ProfilePagePo;
    usersPage: UsersPagePo;
    idSourcesPage: IdSourcesPagePo;
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
    usernameAutocomplete: async ({ page }, use) => {
        await use(new UsernameAutocompletePo(page));
    },
    saveModal: async ({ page, materialPage }, use) => {
        await use(new SaveModalPo(page, materialPage));
    },
    cdePage: async ({ page }, use) => {
        await use(new CdePagePo(page));
    },
    permissibleValueSection: async ({ page, materialPage, inlineEdit, saveModal }, use) => {
        await use(new PermissibleValuePo(page, materialPage, inlineEdit, saveModal));
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
    identifierSection: async ({ page, materialPage, saveModal }, use) => {
        await use(new IdentifierPo(page, materialPage, saveModal));
    },
    relatedDocumentSection: async (
        { page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal },
        use
    ) => {
        await use(new RelatedDocumentPo(page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal));
    },
    submissionInformationSection: async ({ page }, use) => {
        await use(new SubmissionInformationPo(page));
    },
    propertySection: async ({ page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal }, use) => {
        await use(new PropertyPo(page, materialPage, inlineEdit, saveModal, updateRegistrationStatusModal));
    },
    classificationSection: async ({ page, materialPage, saveModal }, use) => {
        await use(new ClassificationPo(page, materialPage, saveModal));
    },
    attachmentSection: async ({ page, materialPage, inlineEdit }, use) => {
        await use(new AttachmentPo(page, materialPage, inlineEdit));
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
    navigationMenu: async ({ page, materialPage, searchPage }, use) => {
        await use(new NavigationMenuPo(page, materialPage, searchPage));
    },
    searchPage: async ({ page, materialPage, myBoardPage }, use) => {
        await use(new SearchPagePo(page, materialPage, myBoardPage));
    },
    searchPreferencesPage: async ({ page }, use) => {
        await use(new SearchPreferencesPagePo(page));
    },
    inlineEdit: async ({ page }, use) => {
        await use(new InlineEditPo(page));
    },
    manageClassificationPage: async ({ page, materialPage }, use) => {
        await use(new ManageClassificationPo(page, materialPage));
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
    adminsPage: async ({ page, materialPage }, use) => {
        await use(new AdminsPo(page, materialPage));
    },
    curatorsPage: async ({ page, materialPage }, use) => {
        await use(new CuratorsPo(page, materialPage));
    },
    editorsPage: async ({ page, materialPage }, use) => {
        await use(new EditorsPo(page, materialPage));
    },
    manageOrganizationsPage: async ({ page, materialPage, inlineEdit }, use) => {
        await use(new ManageOrganizationsPo(page, materialPage, inlineEdit));
    },
    manageTagsPropertiesPage: async ({ page, materialPage }, use) => {
        await use(new ManageTagsPropertiesPo(page, materialPage));
    },
    profilePage: async ({ page }, use) => {
        await use(new ProfilePagePo(page));
    },
    usersPage: async ({ page, materialPage }, use) => {
        await use(new UsersPagePo(page, materialPage));
    },
    idSourcesPage: async ({ page, materialPage }, use) => {
        await use(new IdSourcesPagePo(page, materialPage));
    },
    articlePage: async ({ page, materialPage, inlineEdit }, use) => {
        await use(new ArticlePagePo(page, materialPage, inlineEdit));
    },
    submissionEditPage: async ({ page }, use) => {
        await use(new SubmissionEditPo(page));
    },
    submissionManagePage: async ({ page }, use) => {
        await use(new SubmissionManagePo(page));
    },
});

const ignoredConsoleMessages = [
    `Failed to execute 'postMessage' on 'DOMWindow'`,
    'HttpErrorResponse',
    'Failed to load resource: net::ERR_FAILED',
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
    `Third-party cookie will be blocked.`,
    `Failed to load resource: the server responded with a status of 403`, // create too many board give 403
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
