import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 }); // no retries for edits
test(`Remove organization classification`, async ({
    page,
    searchPage,
    navigationMenu,
    manageClassificationPage,
    materialPage,
    auditTab,
}) => {
    const classificationToBeRemoved = `AE/SAE CDEs`;
    const searchString = `classification.elements.elements.name: "${classificationToBeRemoved}"`;
    const classificationArray = ['CIP', 'Adverse Events', classificationToBeRemoved];

    await test.step(`Search 'cde' with classification to be removed.`, async () => {
        await navigationMenu.gotoCdeSearch();
        await navigationMenu.login(Accounts.nlm);
        await searchPage.searchWithString(searchString);
    });

    await test.step(`Search 'form' with classification to be removed.`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchWithString(searchString);
    });

    await test.step(`Remove org classification`, async () => {
        await navigationMenu.gotoClassification();
        await manageClassificationPage.removeOrgClassification(classificationArray);
    });
    await test.step(`Verify 'cde' search result.`, async () => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchWithString(searchString, 0);
    });

    await test.step(`Verify 'form' search result.`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchWithString(searchString, 0);
    });

    await test.step(`Verify classification audit log`, async () => {
        await page.route(`/server/log/itemLog/classification`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await navigationMenu.gotoAudit();
        await auditTab.classificationAuditLog().click();
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinnerShowAndGone();
        expect(await page.getByText(`${classificationArray.join(' > ')}`).count()).toBeGreaterThanOrEqual(2);
        await page
            .getByText(`${classificationArray.join(' > ')}`)
            .first()
            .click();
        expect(await page.getByText(`delete ${classificationArray.join(' > ')}`).count()).toBeGreaterThanOrEqual(1);
    });
});
