import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Search Filter`, async () => {
    test(`Clear all filters`, async ({ page, searchPage, navigationMenu }) => {
        await navigationMenu.gotoCdeSearch();
        await navigationMenu.login(Accounts.nlm);
        await searchPage.browseOrganization('CTEP');
        await searchPage.classificationFilter('CATEGORY').click();
        await expect(page.getByText('AdEERS')).toBeVisible();
        await searchPage.altClassificationFilterModeToggle().click();
        await expect(page.getByText('(Select Orgs)')).toBeVisible();
        await searchPage.classificationFilter('CTEP').click();
        await searchPage.classificationFilter('DISEASE').click();
        await expect(page.getByText('Bladder (8)')).toBeVisible();

        await searchPage.registrationStatusFilter('Qualified').check();
        await searchPage.dataTypeFilter('Number').check();

        await expect(searchPage.classificationFilterSelected('CTEP', true)).toBeVisible();
        await expect(searchPage.classificationFilterSelected('DISEASE', true)).toBeVisible();
        expect(await searchPage.registrationStatusFilter('Qualified').isChecked()).toBeTruthy();
        expect(await searchPage.dataTypeFilter('Number').isChecked()).toBeTruthy();

        await expect(page.getByText('4 results')).toBeVisible();

        await searchPage.nihEndorsedCheckbox().check();

        await expect(page.getByText('No results were found')).toBeVisible();

        await searchPage.clearAllFilters().click();

        await expect(searchPage.classificationFilterSelected('CTEP')).toBeHidden();
        expect(await searchPage.registrationStatusFilter('Qualified').isChecked()).toBeFalsy();
        expect(await searchPage.dataTypeFilter('Number').isChecked()).toBeFalsy();

        await expect(page.getByText('Search CDEs')).toBeVisible();
    });
});