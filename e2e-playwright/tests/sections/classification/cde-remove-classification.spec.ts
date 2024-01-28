import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';
import { test } from '../../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });

test(`Remove CDE classification`, async ({
    page,
    materialPage,
    auditTab,
    navigationMenu,
    generateDetailsSection,
    classificationSection,
}) => {
    const cdeName = 'Spectroscopy geometry location not applicable indicator';
    const classificationToBeRemoved1 = [
        'NINDS',
        'Disease',
        'Spinal Muscular Atrophy',
        'Classification',
        'Supplemental',
    ];
    const classificationToBeRemoved2 = [
        'NINDS',
        'Disease',
        'Spinal Muscular Atrophy',
        'Domain',
        'Assessments and Examinations',
        'Imaging Diagnostics',
    ];

    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(generateDetailsSection.updated()).toBeHidden();
    });

    await test.step(`Remove classification, then save`, async () => {
        await classificationSection.removeClassification(classificationToBeRemoved1);
        await classificationSection.removeClassification(classificationToBeRemoved2);
    });

    await test.step(`Classification removal does not trigger updated.`, async () => {
        await expect(generateDetailsSection.updated()).toBeHidden();
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
        expect(await page.getByText(classificationToBeRemoved1.join(' > ')).count()).toBeGreaterThanOrEqual(1);
        expect(await page.getByText(classificationToBeRemoved2.join(' > ')).count()).toBeGreaterThanOrEqual(1);
    });
});
