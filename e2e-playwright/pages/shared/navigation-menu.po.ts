import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { listItem, tag } from '../util';

export class NavigationMenuPo {
    protected readonly page: Page;
    protected readonly materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
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

    async gotoSettings() {
        await this.page.getByTestId('logged-in-username').click();
        await this.page.getByTestId('user_settings').click();
        await this.page.waitForSelector('cde-profile', { state: 'visible' });
    }

    async gotoSettingsSubmissionWorkbookValidation() {
        await listItem(this.page, 'Submission Workbook Validation').click();
        await tag(this.page, 'h1', 'Submission Workbook Validation').waitFor();
    }

    async gotoClassification() {
        await this.page.getByTestId('logged-in-username').click();
        await this.page.getByTestId('user_classification').click();
        await this.page.getByText('Manage Classifications').isVisible();
    }

    async gotoAudit() {
        await this.page.getByTestId('logged-in-username').click();
        await this.page.getByTestId('user_audit').click();
        await this.page
            .getByText('Logs', {
                exact: true,
            })
            .isVisible();
    }

    async logout() {
        await this.page.getByTestId('logged-in-username').click();
        await this.page.getByTestId('user_logout').click();
        await this.page.getByText('Our sign in process has changed.').isVisible();
    }

    async gotoMyBoard() {
        await this.page.getByTestId('myBoardsLink').click();
        return this.page.waitForSelector('h1', { state: 'visible' });
    }

    async gotoSubmissions() {
        await this.page.locator('#createEltLink').click();
        await this.materialPage.matMenuItem('Collection').click();
    }

    async gotoArticle() {
        await this.page.locator('#articles').click();
        return this.page.waitForSelector('h1', { state: 'visible' });
    }
}
