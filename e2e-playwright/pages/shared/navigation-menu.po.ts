import { Locator, Page, expect } from '@playwright/test';
import { MaterialPo } from './material.po';
import { listItem, tag } from '../util';
import { CdeTinyIds } from '../../data/cde-tinyId';
import { FormTinyIds } from '../../data/form-tinyId';
import { Account } from '../../model/type';
import { SearchPagePo } from '../search/search-page.po';

export class NavigationMenuPo {
    protected readonly page: Page;
    protected readonly materialPage: MaterialPo;
    protected readonly searchPage: SearchPagePo;

    constructor(page: Page, materialPage: MaterialPo, searchPage: SearchPagePo) {
        this.page = page;
        this.materialPage = materialPage;
        this.searchPage = searchPage;
    }

    private clickUntilMenuShows(buttonLocator: Locator) {
        return new Promise<void>(async (resolve, reject) => {
            await this.page.waitForTimeout(2000); // Try this wait, there maybe some JS code block button click
            await buttonLocator.hover();
            const buttonText = await buttonLocator.innerText();
            this.materialPage
                .matMenuContent()
                .waitFor()
                .then(resolve)
                .catch(async () => {
                    await buttonLocator.click();
                    this.materialPage
                        .matMenuContent()
                        .waitFor()
                        .then(resolve)
                        .catch(() => {
                            reject(`${buttonText} hovered and clicked, but didn't trigger the menu`);
                        });
                });
        });
    }

    private clickUntilUrl(buttonLocator: Locator, Url: RegExp) {
        return new Promise<void>(async (resolve, reject) => {
            await this.page.waitForTimeout(2000); // Try this wait, there maybe some JS code block button click
            await buttonLocator.click();
            const buttonText = await buttonLocator.innerText();
            this.page
                .waitForURL(Url)
                .then(resolve)
                .catch(async () => {
                    await buttonLocator.click();
                    this.page
                        .waitForURL(Url)
                        .then(resolve)
                        .catch(() => {
                            reject(`${buttonText} clicked twice, but ${Url} didn't get navigated`);
                        });
                });
        });
    }

    createButton() {
        return this.page.locator(`[id="createEltLink"]`);
    }

    shutdownBanner() {
        return this.page.getByTestId(`shutdown-banner-container`);
    }

    shutdownBannerCloseButton() {
        return this.page.getByTestId('banner-close-button');
    }

    searchPreferencesButton() {
        return this.page.getByTestId('search-preferences');
    }

    async login({ username, password }: Account) {
        const context = this.page.context();
        await this.page.getByTestId(`login_link`).click();
        const [loginPage] = await Promise.all([
            context.waitForEvent('page'),
            this.page.getByTestId(`open-login-page`).click(),
        ]);
        await loginPage.locator(`[name="username"]`).fill(username);
        await loginPage.locator(`[name="password"]`).fill(password);
        await loginPage.locator(`[id="loginSubmitBtn"]`).click();
        let usernameOnNavigationBanner = username;
        if (username.length > 17) {
            usernameOnNavigationBanner = username.substring(0, 17) + '...';
        }
        await expect(this.page.locator(`[data-testid="logged-in-username"]`)).toHaveText(
            `${usernameOnNavigationBanner.toUpperCase()}expand_more`,
            {
                ignoreCase: true,
            }
        );
        await this.page.getByTestId(`login_link`).waitFor({ state: 'hidden' });
    }

    async gotoCdeSearch() {
        await this.clickUntilUrl(this.page.getByTestId(`menu_cdes_link`), /\/cde\/search/);
        await expect(this.page.getByText(`Searching...`)).toBeHidden();
    }

    async gotoCreateCde() {
        await this.clickUntilMenuShows(this.createButton());
        await this.page.locator('[id="createCDELink"]').click();
        await this.page.waitForURL(/\/createCde/);
        await this.page.getByRole('heading', { name: 'Create Data Element' }).waitFor();
    }

    async searchCdeByName(cdeName: string) {
        await this.gotoCdeSearch();
        await this.searchPage.searchWithString(`"${cdeName}"`, 1);
    }

    /**
     * Description - This method search CDE name with double quotes, make sure login first
     * @param cdeName
     */
    async gotoCdeByName(cdeName: string) {
        const tinyId = CdeTinyIds[cdeName];
        await this.gotoCdeSearch();
        await this.searchPage.searchWithString(`"${cdeName}"`);
        await this.page.locator(`[id="linkToElt_0"]`).click();
        if (tinyId) {
            await this.page.waitForURL(`/deView?tinyId=${tinyId}`, { timeout: 10000 });
        } else {
            await this.page.waitForURL(/\/deView\?tinyId=/, { timeout: 10000 });
        }
        await this.materialPage.matSpinner().waitFor({ state: 'hidden' });
    }

    async gotoFormSearch() {
        await this.clickUntilUrl(this.page.getByTestId(`menu_forms_link`), /\/form\/search/);
        await expect(this.page.getByText(`Searching...`)).toBeHidden();
    }

    async gotoCreateForm() {
        await this.clickUntilMenuShows(this.createButton());
        await this.page.locator('[id="createFormLink"]').click();
        await this.page.waitForURL(/\/createForm/);
        await this.page.getByRole('heading', { name: 'Create Form' }).waitFor();
    }

    async searchFormByName(formName: string) {
        await this.gotoFormSearch();
        await this.searchPage.searchWithString(`"${formName}"`, 1);
    }

    /**
     * Description - This method search Form name with double quote, make sure login first
     * @param formName
     * @param byPassSearch - Go to form directly by URL, which by pass search form name or tinyId
     */
    async gotoFormByName(formName: string, byPassSearch = false) {
        const tinyId = FormTinyIds[formName];
        if (byPassSearch) {
            await this.page.goto(`/formView?tinyId=${tinyId}`);
            return;
        }
        await this.gotoFormSearch();
        await this.searchPage.searchWithString(`"${formName}"`);
        await this.page.locator(`[id="linkToElt_0"]`).click();
        if (tinyId) {
            await this.page.waitForURL(`/formView?tinyId=${tinyId}`, { timeout: 10000 });
        } else {
            await this.page.waitForURL(/\/formView\?tinyId=/, { timeout: 10000 });
        }
        await this.materialPage.matSpinner().waitFor({ state: 'hidden' });
    }

    /**
     * Description - This method search Form with tinyId, should use gotoFormByName() whenever it's possible.
     *               This method exists because there are multiple forms with exact same name, gotoFormByName() returns multiple records.
     * @param formTinyId
     */
    async gotoFormByTinyId(formTinyId: string) {
        await this.gotoFormSearch();
        await this.searchPage.searchWithString(`"${formTinyId}"`);
        await this.page.locator(`[id="linkToElt_0"]`).click();
        await this.page.waitForURL(`/formView?tinyId=${formTinyId}`, { timeout: 10000 });
    }

    async gotoSettings() {
        await this.clickUntilMenuShows(this.page.getByTestId('logged-in-username'));
        await this.page.getByTestId('user_settings').click();
        await this.page.waitForURL(/\/settings/);
        await this.page.waitForSelector('cde-profile', { state: 'visible' });
    }

    async gotoSettingsSubmissionWorkbookValidation() {
        await listItem(this.page, 'Submission Workbook Validation').click();
        await this.page.waitForURL(/\/settings\/submissionWorkbookValidation/);
        await tag(this.page, 'h1', 'Submission Workbook Validation').waitFor();
    }

    async gotoClassification() {
        await this.clickUntilMenuShows(this.page.getByTestId('logged-in-username'));
        await this.page.getByTestId('user_classification').click();
        await this.page.waitForURL(/\/classificationManagement/);
        await this.page.getByText('Manage Classifications').isVisible();
    }

    async gotoAudit() {
        await this.clickUntilMenuShows(this.page.getByTestId('logged-in-username'));
        await this.page.getByTestId('user_audit').click();
        await this.page.waitForURL(/\/siteAudit/);
        await this.page
            .getByText('Logs', {
                exact: true,
            })
            .isVisible();
    }

    async logout() {
        await this.clickUntilMenuShows(this.page.getByTestId('logged-in-username'));
        await this.page.getByTestId('user_logout').click();
        await this.page.waitForURL(/\/login/);
        await this.page.getByText('Our sign in process has changed.').isVisible();
    }

    async gotoMyBoard() {
        await this.clickUntilUrl(this.page.getByTestId('myBoardsLink'), /\/myBoards/);
        return this.page.waitForSelector('h1', { state: 'visible' });
    }

    async gotoSubmissions() {
        await this.clickUntilMenuShows(this.page.locator('#createEltLink'));
        await this.materialPage.matMenuItem('Collection').click();
        await this.page.waitForURL(/\/collection/);
    }

    async gotoArticle() {
        await this.page.locator('#articles').click();
        await this.page.waitForURL(/\/settings\/articles/);
        await this.page.waitForSelector('h1', { state: 'visible' });
    }

    async gotoGuide() {
        await this.clickUntilMenuShows(this.page.locator(`#helpLink`));
        await this.materialPage.matMenuItem('Guides').click();
    }

    async gotoNewFeatures() {
        await this.clickUntilMenuShows(this.page.locator(`#helpLink`));
        await this.materialPage.matMenuItem('New Features').click();
        await this.page.waitForURL(/\/whatsNew/);
    }

    async gotoResources() {
        await this.clickUntilMenuShows(this.page.locator(`#helpLink`));
        await this.materialPage.matMenuItem('Resources').click();
        await this.page.waitForURL(/\/resources/, { timeout: 10000 }); //resources take very long to load
    }

    async gotoAbout() {
        await this.clickUntilUrl(this.page.locator(`#aboutLink`), /\/about/);
    }
}
