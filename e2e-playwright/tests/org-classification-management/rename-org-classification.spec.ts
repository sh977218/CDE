import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 }); // no retries for edits
test(`Rename organization classification`, async ({
    page,
    searchPage,
    navigationMenu,
    manageClassificationPage,
    materialPage,
    auditTab,
}) => {
    const classificationToBeRenamed = `Protocol Experience`;
    const newClassificationName = `Experiencies`;
    const searchStringWithOldClassification = `classification.elements.elements.name: "${classificationToBeRenamed}"`;
    const searchStringWithNewClassification = `classification.elements.elements.name: "${newClassificationName}"`;
    const classificationArray = ['NINDS', 'Domain', classificationToBeRenamed];

    await test.step(`Go to home page`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Search cde with classification to be removed.`, async () => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(searchStringWithOldClassification);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();

        await searchPage.searchQueryInput().fill(searchStringWithNewClassification);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });

    await test.step(`Search form with classification to be removed.`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchQueryInput().fill(searchStringWithOldClassification);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });

    await test.step(`Rename org classification`, async () => {
        await navigationMenu.gotoClassification();
        await manageClassificationPage.renameOrgClassification(classificationArray, newClassificationName);
    });

    await test.step(`Verify cde search result.`, async () => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(searchStringWithNewClassification);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });

    await test.step(`Verify form search result.`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchQueryInput().fill(searchStringWithNewClassification);
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });

    await test.step(`Verify classification audit log`, async () => {
        await page.route(`/server/log/itemLog/classification`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await navigationMenu.gotoAudit();
        await auditTab.classificationAuditLog().click();
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        expect(await page.getByText(`${classificationArray.join(' > ')}`).count()).toBeGreaterThanOrEqual(2);
        await page
            .getByText(`${classificationArray.join(' > ')}`)
            .first()
            .click();
        expect(
            await page.getByText(`rename  ${classificationArray.join(' > ')}  to ${newClassificationName}`).count()
        ).toBeGreaterThanOrEqual(1);
    });
});