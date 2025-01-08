import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`More like this`, async () => {
    test(`CDE page`, async ({ page, relatedContentSection, navigationMenu }) => {
        const cdeName = 'Patient Gender Category';
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoCdeByName(cdeName);

        await relatedContentSection.moreLikeThisTab().click();

        const moreLikeThisListLink = relatedContentSection
            .moreLikeThisList()
            .locator('cde-summary-heading h2')
            .getByRole('link');
        await expect(moreLikeThisListLink.first()).toHaveText('Person Gender Text Type');
        await expect(moreLikeThisListLink.nth(1)).toHaveText('Patient Gender Code');
    });
    test(`more like this does not show retired`, async ({ page, relatedContentSection, navigationMenu }) => {
        const cdeName = 'MltTest';
        await navigationMenu.login(Accounts.ctepEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await relatedContentSection.moreLikeThisTab().click();
        await expect(page.locator('id=mltAccordion')).not.toHaveText(cdeName);
    });
});
