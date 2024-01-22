import { Locator, Page, expect } from '@playwright/test';

export class InlineEditPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    editIcon(locator: Locator) {
        return locator.getByTestId('inline-edit-icon');
    }

    inputField(locator: Locator) {
        return locator.getByTestId('inline-edit-input');
    }

    /**
     * Description - Return ck edit textarea
     * @param containerLocator - The outer locator where the inline area edit contained by
     * @param html - Depends on Plain or Rich text, the textarea locator differs based on this flag
     * @private
     */
    private ckEditTextarea(containerLocator: Locator, html = false) {
        if (html) {
            return containerLocator
                .locator(`cde-inline-area-edit`, {
                    has: containerLocator.locator(`textarea`),
                })
                .locator(`.cke_contents`);
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
                x: box?.width || 0,
                y: box?.height || 0,
            },
        });
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.press('Backslash');
        await this.page.waitForTimeout(1000);
    }

    /**
     * Description - Type string in the ck edit textarea
     * @param containerLocator - The outer locator where the inline area edit contained by
     * @param inputString - String to be typed in, char by char
     * @param html - Whether is Rich text or not, the textarea locator diffs based on this flag
     */
    async typeTextField(containerLocator: Locator, inputString: string, html = false) {
        const textareaLocator = this.ckEditTextarea(containerLocator, html);
        await expect(textareaLocator).toBeVisible();
        const box = await textareaLocator.boundingBox();
        // click 50 px left top from bottom right corner of the textarea.
        await textareaLocator.click({
            position: {
                x: (box?.width || 0) - 50,
                y: (box?.height || 0) - 10,
            },
        });
        await this.page.keyboard.type(inputString);
        await this.page.waitForTimeout(1000);
        await this.confirmButton(containerLocator).click();
    }

    confirmButton(locator: Locator) {
        return locator.getByRole('button', { name: 'Confirm', exact: true });
    }

    discardButton(locator: Locator) {
        return locator.getByRole('button', { name: 'Discard', exact: true });
    }

    plainTextButton(locator: Locator) {
        return locator.getByRole('button', { name: 'Plain Text', exact: true });
    }

    richTextButton(locator: Locator) {
        return locator.getByRole('button', { name: 'Rich Text', exact: true });
    }
}
