import { Locator, Page, expect } from '@playwright/test';
import { MaterialPo } from './material.po';
import { listItem, tag } from '../util';
import { CdeTinyIds } from '../../data/cde-tinyId';
import { FormTinyIds } from '../../data/form-tinyId';
import { Account } from '../../model/type';

export class NavigationMenuPo {
    protected readonly page: Page;
    protected readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    private clickUntilMenuShows(buttonLocator: Locator) {
        return new Promise<void>(async (resolve, reject) => {
            await buttonLocator.hover();
            const buttonText = await buttonLocator.innerText();
            this.materialPage
                .matMenuContent()
                .waitFor()
                .then(() => {
                    console.info(`hovered ${buttonText} and menu shows. Continue...`);
                    resolve();
                })
                .catch(async () => {
                    console.info(`hovered ${buttonText} and menu is not showing. Try click it...`);
                    await buttonLocator.click();
                    this.materialPage
                        .matMenuContent()
                        .waitFor()
                        .then(() => {
                            console.info(`clicked ${buttonText} again and menu shows. Continue...`);
                            resolve();
                        })
                        .catch(async e => {
                            console.info(
                                `clicked ${buttonText} again and menu is still not showing. Something wrong. Throwing error`
                            );
                            reject(`${buttonText} hovered and clicked, but didn't trigger the menu`);
                        });
                });
        });
    }

    private clickUntilUrl(buttonLocator: Locator, Url: RegExp) {
        return new Promise<void>(async (resolve, reject) => {
            await buttonLocator.click();
            const buttonText = await buttonLocator.innerText();
            this.page
                .waitForURL(Url)
                .then(() => {
                    console.info(`clicked ${buttonText} and ${Url} navigated. Continue...`);
                    resolve();
                })
                .catch(async () => {
                    console.info(`clicked ${buttonText} and ${Url} didn't get navigated. Try click it again...`);
                    await buttonLocator.click();
                    this.page
                        .waitForURL(Url)
                        .then(() => {
                            console.info(`clicked ${buttonText} again and ${Url} navigated. Continue...`);
                            resolve();
                        })
                        .catch(async e => {
                            console.info(
                                `clicked ${buttonText} again and ${Url} still didn't get navigated. Something wrong. Throwing error`
                            );
                            reject(`${buttonText} clicked twice, but ${Url} didn't get navigated`);
                        });
                });
        });
    }

    private createButton() {
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
        await this.page.waitForSelector(`[data-testid="logged-in-username"]`, {
            state: 'visible',
        });
        // wait for URL not being /login
        await expect(this.page).not.toHaveURL(/\/login/);
    }

    async gotoCdeSearch() {
        await this.clickUntilUrl(this.page.getByTestId(`menu_cdes_link`), /\/cde\/search/);
    }

    async gotoCreateCde() {
        await this.clickUntilMenuShows(this.createButton());
        await this.page.locator('[id="createCDELink"]').click();
        await this.page.waitForURL(/\/createCde/);
        await this.page.getByRole('heading', { name: 'Create Data Element' }).waitFor();
    }

    /**
     * Description - This method search CDE name with double quotes, make sure login first
     * @param cdeName
     */
    async gotoCdeByName(cdeName: string) {
        const tinyId = CdeTinyIds[cdeName];
        await this.gotoCdeSearch();
        await this.page.getByTestId(`search-query-input`).fill(`"${cdeName}"`);
        await this.page.getByTestId(`search-submit-button`).click();
        await this.page.getByText(`results. Sorted by relevance.`).waitFor();
        await this.page.locator(`[id="linkToElt_0"]`).click();
        await this.page.waitForURL(`/deView?tinyId=${tinyId}`);
    }

    async gotoFormSearch() {
        await this.clickUntilUrl(this.page.getByTestId(`menu_forms_link`), /\/form\/search/);
    }

    async gotoCreateForm() {
        await this.clickUntilMenuShows(this.createButton());
        await this.page.locator('[id="createFormLink"]').click();
        await this.page.waitForURL(/\/createForm/);
        await this.page.getByRole('heading', { name: 'Create Form' }).waitFor();
    }

    async searchFormByName(formName: string) {
        await this.gotoFormSearch();
        await this.page.getByTestId(`search-query-input`).fill(`"${formName}"`);
        await this.page.getByTestId(`search-submit-button`).click();
        await this.page.getByText(`1 results. Sorted by relevance.`).waitFor();
    }

    /**
     * Description - This method search Form name with double quote, make sure login first
     * @param formName
     */
    async gotoFormByName(formName: string) {
        const tinyId = FormTinyIds[formName];
        await this.gotoFormSearch();
        await this.page.getByTestId(`search-query-input`).fill(`"${formName}"`);
        await this.page.getByTestId(`search-submit-button`).click();
        await this.page.getByText(`results. Sorted by relevance.`).waitFor();
        await this.page.locator(`[id="linkToElt_0"]`).click();
        await this.page.waitForURL(`/formView?tinyId=${tinyId}`);
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
