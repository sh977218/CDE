import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

test(`Browser search filter`, async ({ page, materialPage, navigationMenu, searchPage }) => {
    await navigationMenu.gotoCdeSearch();

    await test.step(`org classification`, async () => {
        await searchPage.organizationTitleLink().filter({ hasText: `caBIG` }).click();
        await searchPage.classificationFilterSelected(`caBIG`).hover();
        await expect(materialPage.matTooltip()).toHaveText('Remove this classification filter');
        await searchPage.searchResultInfoBar().click();

        await searchPage.classificationFilter().filter({ hasText: `caBIG` }).hover();
        await expect(materialPage.matTooltip()).toHaveText('Cancer Biomedical Informatics Grid');
        await searchPage.searchResultInfoBar().click();
    });

    await test.step(`org classification filter number`, async () => {
        const orgClassificationFilter = searchPage.classificationFilter().filter({
            hasText: 'Clinical Trial Mgmt Systems',
        });
        const orgClassificationFilterNumber = searchPage.parseNumberFromFilterText(
            await orgClassificationFilter.innerText()
        );
        await orgClassificationFilter.click();
        await expect(searchPage.searchResultNumber()).toHaveText(orgClassificationFilterNumber);
    });

    await test.step(`org classification filter number`, async () => {
        await expect(materialPage.paginatorRangeLabel()).toHaveText(/1 – 20 of \d*/);
        await materialPage.paginatorNext().click();
        await expect(materialPage.paginatorRangeLabel()).toHaveText(/21 – \d* of \d*/);
        await expect(page).toHaveURL(/&page=2/);
    });

    await test.step(`registration status filter number`, async () => {
        const registrationStatus = searchPage.registrationStatusFilter('Qualified');
        await registrationStatus.hover();
        await expect(materialPage.matTooltip()).toHaveText(
            'Qualified elements are managed by their Stewards and may be eligible to become Standard.'
        );
        const registrationStatusNumber = searchPage.parseNumberFromFilterText(await registrationStatus.innerText());
        await registrationStatus.click();
        await expect(searchPage.searchResultNumber()).toHaveText(registrationStatusNumber);
        await expect(searchPage.activeFilterRegistrationStatus()).toContainText('Qualified');
    });

    await test.step(`data type filter number`, async () => {
        const datatype = searchPage.dataTypeFilter('Value List');
        const datatypeNumber = searchPage.parseNumberFromFilterText(await datatype.innerText());
        await datatype.click();
        await expect(searchPage.searchResultNumber()).toHaveText(datatypeNumber);
        await expect(searchPage.activeFilterDateType()).toContainText('Value List');
    });

    await test.step(`clear all filter`, async () => {
        await searchPage.clearAllFilters().click();
        await searchPage.organizationTitleLink().filter({ hasText: `caBIG` }).click();
        await expect(materialPage.paginatorRangeLabel()).toHaveText(/1 – 20 of \d*/);
    });

    await test.step(`go to search welcome page and reset all filters`, async () => {
        const registrationStatus = searchPage.registrationStatusFilter('Qualified');
        await registrationStatus.click();
        const datatype = searchPage.dataTypeFilter('Value List');
        await datatype.click();
        await navigationMenu.gotoCdeSearch();
        await expect(page.getByText('Enter a phrase/text or explore')).toBeVisible();
    });
});
