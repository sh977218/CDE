import { Locator, Page, expect } from '@playwright/test';
import { InlineEditPo } from './inline-edit.po';
import { MaterialPo } from './material.po';

export class AttachmentPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
    }

    uploadMoreFile() {
        return this.page.locator(`[for="fileToUpload"]`);
    }

    attachments() {
        return this.page.getByTestId(`attachmentDiv`);
    }

    async uploadAttachment(filePath: string) {
        await this.page.setInputFiles(`[id="fileToUpload"]`, filePath);
        await this.page.waitForSelector(`[data-testid="attachmentDiv"]`, { state: 'visible' });
        await this.materialPage.checkAlert(`Attachment added.`);
    }

    async removeAttachment(attachmentLocator: Locator) {
        await attachmentLocator.getByTestId(`removeAttachmentButton`).click();
        await this.page.waitForSelector(`[data-testid="attachmentDiv"]`, { state: 'detached' });
    }

    /**
     *
     * @param index - Zero base index
     */
    async setDefaultAttachmentByIndex(index: number) {
        await this.attachments().nth(index).getByTestId(`show-attachment-in-search-result-checkbox`).check();
        await expect(this.attachments().nth(index).getByTestId(`default-attachment-checkbox`)).toHaveText('Yes');
        await this.materialPage.checkAlert('Saved');
    }
}
