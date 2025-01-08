import { Locator, Page, expect } from '@playwright/test';

const INLINE_EDIT_TEXTAREA_OFFSET_X = 50;
const INLINE_EDIT_TEXTAREA_OFFSET_Y = 15;

export class InlineEditPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    editIcon(locator: Locator) {
        return locator.getByTestId('inline-edit-icon');
    }

    inputField(locator: Locator) {
        return locator.getByTestId('inline-edit-input');
    }
    selectField(locator: Locator) {
        return locator.getByTestId('inline-edit-select');
    }

    /**
     * Description - Return ck edit textarea
     * @param containerLocator - The outer locator where the inline area edit contained by
     * @param html - Depends on Plain or Rich text, the textarea locator differs based on this flag
     * @private
     */
    private ckEditTextarea(containerLocator: Locator, html = false) {
        if (html) {
            return containerLocator.getByRole(`textbox`);
        } else {
            return containerLocator.locator(`cde-inline-area-edit textarea`);
        }
    }

    /**
     * Description - Clear ck edit textarea, by click text area and press CTRL+A, then Backslash
     * @param containerLocator - The outer locator where the inline area edit contained by
     * @param html - Whether is Rich text or not, the textarea locator diffs based on this flag
     */
    async clearTextField(containerLocator: Locator, html = false) {
        const textareaLocator = this.ckEditTextarea(containerLocator, html);
        const box = await textareaLocator.boundingBox();
        await textareaLocator.click({
            position: {
                x: (box?.width || 0) - INLINE_EDIT_TEXTAREA_OFFSET_X,
                y: (box?.height || 0) - INLINE_EDIT_TEXTAREA_OFFSET_Y,
            },
            force: html,
        });
        await this.page.waitForTimeout(2000);
        await this.page.keyboard.press('Control+a');
        await this.page.waitForTimeout(2000);
        await this.page.keyboard.press('Backspace');
        await this.page.waitForTimeout(1000);
    }

    /**
     * Description - Type string in the ck edit textarea.
     * @param containerLocator - The outer locator where the inline area edit contained by
     * @param inputString - String to be typed in, char by char
     * @param html - Whether is Rich text or not, the textarea locator diffs based on this flag
     */
    async typeTextField(containerLocator: Locator, inputString: string, html = false) {
        /**
         * html format string can only be inputted through plain textarea,
         * then click rich button right before click save button.
         */
        await this.plainTextButton(containerLocator).click();

        const textareaLocator = this.ckEditTextarea(containerLocator, false);
        await textareaLocator.fill(inputString);
        await this.page.waitForTimeout(2000);
        if (html) {
            await this.richTextButton(containerLocator).click();
        }
        await this.confirmButton(containerLocator).click();
    }

    confirmButton(locator: Locator) {
        return this.page.getByRole('button', { name: 'Confirm', exact: true });
    }

    discardButton(locator: Locator) {
        return this.page.getByRole('button', { name: 'Discard', exact: true });
    }

    plainTextButton(locator: Locator) {
        return this.page.getByRole('button', { name: 'Plain Text', exact: true });
    }

    richTextButton(locator: Locator) {
        return this.page.getByRole('button', { name: 'Rich Text', exact: true });
    }

    async editInlineEdit(inlineEditorLocator: Locator, text: string) {
        await this.editIcon(inlineEditorLocator).click();
        await this.inputField(inlineEditorLocator).fill(text);
        await this.confirmButton(inlineEditorLocator).click();
    }
}
