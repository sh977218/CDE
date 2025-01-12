import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`Form cde list`, async ({ page, materialPage, navigationMenu, generateDetailsSection, inlineEdit }) => {
    const formName = 'Form: Answer List Test';
    await navigationMenu.gotoFormByName(formName, true);
    await page.locator(`id=cdeListBtn`).click();
    await materialPage.matDialog().waitFor();
    await expect(materialPage.matDialog().locator('.card-header')).toContainText([
        'Patient Gender Category',
        'Race Category Text',
        'CTC Adverse Event Apnea Grade',
    ]);
});
