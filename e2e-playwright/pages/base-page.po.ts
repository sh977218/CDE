import { Locator, Page } from '@playwright/test';

export class BasePagePo {

    protected page: Page;


    constructor(page: Page) {
        this.page = page
    }

    async login(username, password) {
        const context = this.page.context();
        await this.page.locator(`[test-automation-id="login_link"]`).click();
        const [loginPage] = await Promise.all([
            context.waitForEvent('page'),
            this.page.locator(`[test-automation-id="open-login-page"]`).click()
        ])
        await loginPage.locator(`[name="username"]`).fill(username);
        await loginPage.locator(`[name="password"]`).fill(password);
        await loginPage.locator(`[id="loginSubmitBtn"]`).click();
        await this.page.waitForSelector(`[test-automation-id="logged-in-username"]`, {
            state: 'visible'
        })
    }

    async goToForm(tinyId) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`,{state:'visible'});
    }
    async goToCde(tinyId) {
        await this.page.goto(`/deView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`,{state:'visible'});
    }
    get navMenu() {
        return this.page.locator(`aio-toc`)
    }
    goToHistory() {
        return this.page.getByText('History').click()
    }

    goToAttachments() {
        return this.page.locator(`[title="Attachments"]`).click()
    }

    get uploadMoreFile() {
        return this.page.locator(`[for="fileToUpload"]`)
    }

    async uploadAttachment(filePath) {
        await this.page.setInputFiles(`[id="fileToUpload"]`, filePath);
        await this.page.waitForSelector(`[test-automation-id="attachmentDiv"]`, {state: 'visible'})
    }

    async removeAttachment(attachmentLocator: Locator) {
        await attachmentLocator.locator(`[test-automation-id="removeAttachmentButton"]`).click();
        await this.page.waitForSelector(`[test-automation-id="attachmentDiv"]`, {state: 'detached'})
    }

    get attachments() {
        return this.page.locator(`[test-automation-id="attachmentDiv"]`)
    }

    async goToHome() {
        await this.page.goto('/home');
        await this.page.waitForSelector(`text=Use of CDEs Supports the NIH Data Management and Sharing Policy`,{state:'visible'});
    }

    async goToSearch(module){
        await this.page.goto(`/${module}/search`);
        await this.page.waitForSelector(`text=Enter a phrase/text or explore`,{state:'visible'});
    }

    get searchBar() {
        return this.page.locator(`#quickSearchForm`)
    }

    get imageIcon() {
        return this.page.locator(`[alt="NIH Common Data Elements (CDE) logo"]`)
    }

    get imageButtons() {
        return this.page.locator(`.button.menuButton1`);
    }
}
