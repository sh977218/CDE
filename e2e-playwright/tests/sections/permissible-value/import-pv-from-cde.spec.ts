import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import cdeTinyId from '../../../data/cde-tinyId';
import user from '../../../data/user';

test(`Import permissible value from CDE`, async ({
    page,
    searchPage,
    saveModal,
    navigationMenu,
    materialPage,
    cdePage,
    permissibleValueSection,
    historySection,
    homePage,
}) => {
    const cdeName = 'Non-Pathology Findings';

    await test.step(`Navigate to CDE and login`, async () => {
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await expect(page.getByRole('heading', { name: 'Permissible Value' })).toBeVisible();
        await page.getByRole('heading', { name: 'Permissible Value' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Import PV from CDE has duplicated PVs`, async () => {
        await permissibleValueSection.importPermissibleValueFromCDdeButton().click();
        await materialPage.matDialog().waitFor({ state: 'visible' });
        await searchPage.searchQueryInput().fill('mJQiShWEW');
        await searchPage.searchSubmitButton().click();
        await page.waitForTimeout(5000);
        await page.waitForLoadState('networkidle', { timeout: 3000 });
        await expect(searchPage.searchResultInfoBar()).toHaveText('1 results. Sorted by relevance.');
        await searchPage.searchResultList().getByRole('button', { name: 'Add', exact: true }).click();
        await materialPage.checkAlert('Permissible Values imported');
    });

    await test.step(`Verify Error, cannot be published and delete the draft`, async () => {
        await expect(page.getByText('The following errors need to be corrected in order to Publish')).toBeVisible();
        await expect(page.getByText('Duplicate Permissible Value')).toBeVisible();
        await saveModal.publishDraftButton().click();
        await materialPage.checkAlert('Please fix all errors before publishing');
        await saveModal.deleteDraft();
    });

    await test.step(`Import PV from CDE doesn't have duplicated PVs`, async () => {
        await permissibleValueSection.importPermissibleValueFromCDdeButton().click();
        await materialPage.matDialog().waitFor({ state: 'visible' });
        await searchPage.searchQueryInput().fill('CK8F0tHZ5wp');
        await searchPage.searchSubmitButton().click();
        await searchPage.searchResultList().getByRole('button', { name: 'Add', exact: true }).click();
        await materialPage.checkAlert('Permissible Values imported');
    });

    await test.step(`Verify PV from imported Code`, async () => {
        const tableRows = permissibleValueSection.permissibleValueTableRows();
        const lastRow = tableRows.last();
        const lastRowTds = lastRow.locator('td');
        await expect(lastRowTds.first().locator(`cde-inline-view`)).toHaveText(
            `Native Hawaiian or Other Pacific Islander`
        );
        await expect(lastRowTds.nth(2)).toHaveText(`C41219`);
        await expect(lastRowTds.nth(3)).toHaveText(`NCI Thesaurus`);
        await expect(lastRowTds.nth(4)).toHaveText(`C41219`);
        await expect(lastRowTds.nth(5)).toHaveText(`NCI Thesaurus`);
    });

    await test.step(`Verify history`, async () => {
        await page.getByRole('heading', { name: 'History' }).scrollIntoViewIfNeeded();
        await historySection.selectHistoryTableRowsToCompare(0, 1);
        await expect(
            materialPage.matDialog().getByText(`Code Name:Native Hawaiian or Other Pacific Islander`)
        ).toBeVisible();
    });
});
