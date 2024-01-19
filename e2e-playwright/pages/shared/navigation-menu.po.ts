import { Locator, Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { listItem, tag } from '../util';

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
                            console.info(`clicked ${buttonText} and menu shows. Continue...`);
                            resolve();
                        })
                        .catch(async e => {
                            console.info(
                                `clicked ${buttonText} and menu is still not showing. Something wrong. Throwing error`
                            );
                            reject(`${buttonText} hovered and clicked, but not trigger the menu`);
                        });
                });
        });
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

    async login(username: string, password: string) {
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
    }

    async gotoCdeSearch() {
        await this.page.getByTestId(`menu_cdes_link`).click();
        await this.page.waitForURL(/\/cde\/search/);
    }

    async gotoFormSearch() {
        await this.page.getByTestId(`menu_forms_link`).click();
        await this.page.waitForURL(/\/form\/search/);
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
        await this.page.getByTestId('myBoardsLink').click();
        await this.page.waitForURL(/\/myBoards/);
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
}
