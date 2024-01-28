import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test(`CDE classify classification`, async ({ page, materialPage, auditTab, navigationMenu, classificationSection }) => {
    const cdeName =
        'Person Primary Care Evaluation of Mental Disorders Patient Health Questionnaire Total Score Psychometric Questionnaire Two Digit Score';
    const classificationArray = ['TEST', 'Denise Test CS', 'Denise Sentinel CSI'];

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(classificationArray[1])).toBeHidden();
    });

    await test.step(`Classify cde`, async () => {
        await classificationSection.addClassification(classificationArray);
    });

    await test.step(`New classification is visible for Form`, async () => {
        await expect(page.getByText(classificationArray[1])).toBeVisible();
    });

    await test.step(`Classify cde with same classification`, async () => {
        await classificationSection.addRecentClassification(classificationArray);
    });

    await test.step(`Verify Classification audit`, async () => {
        await navigationMenu.gotoAudit();
        await auditTab.classificationAuditLog().click();
        await page.route(`/server/log/itemLog/classification`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        expect(await page.getByText(classificationArray.join(' > ')).count()).toBeGreaterThanOrEqual(1);
    });
});
