import { Page } from '@playwright/test';

export class NavigationMenuPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async login(username, password) {
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
}
