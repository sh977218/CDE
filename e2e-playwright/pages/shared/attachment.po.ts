import { Locator, Page } from '@playwright/test';
import { InlineEditPo } from './inline-edit.po';

export class AttachmentPo {
    private readonly page: Page;
    private readonly inlineEdit: InlineEditPo;

    constructor(page: Page, inlineEdit: InlineEditPo) {
        this.page = page;
        this.inlineEdit = inlineEdit;
    }
    get uploadMoreFile() {
        return this.page.locator(`[for="fileToUpload"]`);
    }

    async uploadAttachment(filePath: string) {
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
}
