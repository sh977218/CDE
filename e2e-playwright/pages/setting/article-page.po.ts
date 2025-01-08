import { Page } from '@playwright/test';
import { InlineEditPo } from '../shared/inline-edit.po';
import { MaterialPo } from '../shared/material.po';

export class ArticlePagePo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
    }

    articleKeySelection() {
        return this.page.getByTestId('article-key-selection');
    }

    shutdownToggle() {
        return this.page.getByTestId('shutdown-toggle');
    }

    articleEditContainer() {
        return this.page.getByTestId(`article-edit-container`);
    }

    /**
     * resource is en exception case that it does input HTML code in the CK edit and save as HTML encoded value.
     * @param text
     * @param config
     */
    async editArticle(text: string, config = { replace: false, html: false }) {
        const articleEditContainer = this.articleEditContainer();
        await this.page.waitForTimeout(2000); // give 2 seconds before click edit, this wait is not a 100% sure fix.
        await this.inlineEdit.editIcon(articleEditContainer).click();
        await this.page.waitForTimeout(2000); // give 2 seconds so cd editor can be loaded.
        if (config.html) {
            await this.inlineEdit.richTextButton(articleEditContainer).click();
        }
        if (config.replace) {
            await this.inlineEdit.clearTextField(articleEditContainer, config.html);
        }

        const textareaLocator = this.inlineEdit.ckEditTextarea(articleEditContainer, config.html);
        await textareaLocator.fill(text);
        await this.page.waitForTimeout(2000);

        await this.inlineEdit.confirmButton(articleEditContainer).click();
        await this.materialPage.checkAlert(`Saved`);
    }
}
