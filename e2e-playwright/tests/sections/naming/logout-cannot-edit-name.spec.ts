import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`Logout cannot edit name`, async () => {
    test(`CDE`, async ({ page, inlineEdit, navigationMenu }) => {
        const cdeName = 'cde for test cde reorder detail tabs';
        await navigationMenu.gotoCdeByTinyIdDirectly(cdeName);
        await expect(inlineEdit.editIcon(page.locator('cde-naming'))).toHaveCount(0);
    });

    test(`Form`, async ({ page, inlineEdit, navigationMenu }) => {
        const formName = 'Frontal Systems Behavioral Scale (FrSBe)';
        await navigationMenu.gotoFormByName(formName);
        await expect(inlineEdit.editIcon(page.locator('cde-naming'))).toHaveCount(0);
    });
});
