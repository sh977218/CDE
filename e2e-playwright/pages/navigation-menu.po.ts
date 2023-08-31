import { Page } from '@playwright/test';
import { MaterialPo } from '../pages/material.po';

export class NavigationMenuPo {
    protected page: Page;
    protected matPage: MaterialPo;

    constructor(page: Page) {
        this.page = page;
        this.matPage = new MaterialPo(page);
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
        await this.page.getByTestId('logged-in-username').hover();
        await this.page.getByTestId('user_settings').click();
        await this.page.waitForSelector('cde-profile', { state: 'visible' });
    }

    async gotoClassification() {
        await this.page.getByTestId('logged-in-username').hover();
        await this.page.getByTestId('user_classification').click();
        await this.page.getByText('Manage Classifications').isVisible();
    }

    async gotoAudit() {
        await this.page.getByTestId('logged-in-username').hover();
        await this.page.getByTestId('user_audit').click();
        await this.page
            .getByText('Logs', {
                exact: true,
            })
            .isVisible();
    }

    async logout() {
        await this.page.getByTestId('logged-in-username').hover();
        await this.page.getByTestId('user_logout').click();
        await this.page.getByText('Our sign in process has changed.').isVisible();
    }

    async gotoMyBoard() {
        await this.page.getByTestId('myBoardsLink').click();
        return this.page.waitForSelector('h1', { state: 'visible' });
    }

    async gotoSubmissions() {
        await this.page.locator('#createEltLink').hover();
        await this.matPage.matMenuItem('Collection').click();
    }
}
