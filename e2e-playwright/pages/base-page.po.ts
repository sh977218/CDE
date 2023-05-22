import { Locator, Page } from '@playwright/test';

export class BasePagePo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    async goToHome() {
        await this.page.goto('/home');
        await this.page.waitForSelector(`text=Use of CDEs Supports the NIH Data Management and Sharing Policy`, {
            state: 'visible',
        });
    }

    async goToSearch(module) {
        await this.page.goto(`/${module}/search`);
        await this.page.waitForSelector(`text=Enter a phrase/text or explore`, { state: 'visible' });
    }

    async goToForm(tinyId) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }
    async goToCde(tinyId) {
        await this.page.goto(`/deView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }
    /* Generate Details */
    origin(){
        return this.page.getByTestId('origin')
    }
    /* Generate Details */

    /* Attachment */
    get uploadMoreFile() {
        return this.page.locator(`[for="fileToUpload"]`);
    }

    async uploadAttachment(filePath) {
        await this.page.setInputFiles(`[id="fileToUpload"]`, filePath);
        await this.page.waitForSelector(`[data-testid="attachmentDiv"]`, { state: 'visible' });
    }

    async removeAttachment(attachmentLocator: Locator) {
        await attachmentLocator.getByTestId(`removeAttachmentButton`).click();
        await this.page.waitForSelector(`[data-testid="attachmentDiv"]`, { state: 'detached' });
    }

    attachments() {
        return this.page.getByTestId(`attachmentDiv`);
    }
    /* Attachment */
}
