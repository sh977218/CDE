import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test(`Form classify classification`, async ({
    page,
    materialPage,
    auditTab,
    navigationMenu,
    classificationSection,
}) => {
    const formName = 'Functional Imaging';
    const classificationArray = ['TEST', 'Eligibility Criteria'];

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(classificationArray[1])).toBeHidden();
    });

    await test.step(`Classify form`, async () => {
        await classificationSection.addClassification(classificationArray);
    });

    await test.step(`New classification is visible for Form`, async () => {
        await expect(page.getByText(classificationArray[1])).toBeVisible();
    });

    await test.step(`Classify form with same classification`, async () => {
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
        await materialPage.matSpinnerShowAndGone();
        expect(await page.getByText(classificationArray.join(' > ')).count()).toBeGreaterThanOrEqual(1);
    });
});
