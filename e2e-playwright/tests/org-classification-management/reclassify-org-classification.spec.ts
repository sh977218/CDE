import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });

test(`Reclassify org classification`, async ({
    page,
    materialPage,
    auditTab,
    navigationMenu,
    manageClassificationPage,
}) => {
    test.slow();
    const cdeName = 'Gastrointestinal therapy water flush status';
    const formName = `Frontal Systems Behavioral Scale (FrSBe)`;
    const existingClassificationArray = ['org / or Org', 'OldClassification'];
    const newClassificationArray = ['org / or Org', 'OldFormClassification'];

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`New classification is not visible for CDE`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(existingClassificationArray[1])).toBeVisible();
        await expect(page.getByText(newClassificationArray[1])).toBeHidden();
    });

    await test.step(`New classification is not visible for Form`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(existingClassificationArray[1])).toBeVisible();
        await expect(page.getByText(newClassificationArray[1])).toBeHidden();
    });

    await test.step(`Reclassify classification, then save`, async () => {
        await navigationMenu.gotoClassification();
        await manageClassificationPage.reclassifyOrgClassification(existingClassificationArray, newClassificationArray);
    });

    await test.step(`New classification is visible for CDE`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(existingClassificationArray[1])).toBeVisible();
        await expect(page.getByText(newClassificationArray[1])).toBeVisible();
    });

    await test.step(`New classification is visible for Form`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(existingClassificationArray[1])).toBeVisible();
        await expect(page.getByText(newClassificationArray[1])).toBeVisible();
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
        expect(await page.getByText(newClassificationArray.join(' > ')).count()).toBeGreaterThanOrEqual(1);
    });
});
