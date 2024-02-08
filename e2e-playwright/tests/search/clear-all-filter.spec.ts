import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Clear all filters`, async ({ page, searchPage, navigationMenu }) => {
    await navigationMenu.gotoCdeSearch();
    await navigationMenu.login(Accounts.nlm);
    await searchPage.browseOrganization('CTEP');
    await searchPage.classificationFilterByNameAndNumber('CATEGORY').click();
    await expect(page.getByText('AdEERS')).toBeVisible();
    await searchPage.altClassificationFilterModeToggle().click();
    await expect(page.getByText('(Select Orgs)')).toBeVisible();
    await searchPage.classificationFilterByNameAndNumber('CTEP').click();
    await searchPage.classificationFilterByNameAndNumber('DISEASE').click();
    await expect(page.getByText('Bladder (8)')).toBeVisible();

    await searchPage.registrationStatusFilterInput('Qualified').check();
    await searchPage.dataTypeFilterInput('Number').check();

    await expect(searchPage.classificationFilterSelected('CTEP', true)).toBeVisible();
    await expect(searchPage.classificationFilterSelected('DISEASE', true)).toBeVisible();
    expect(await searchPage.registrationStatusFilterInput('Qualified').isChecked()).toBeTruthy();
    expect(await searchPage.dataTypeFilterInput('Number').isChecked()).toBeTruthy();

    await expect(page.getByText('4 results')).toBeVisible();

    await searchPage.nihEndorsedCheckbox().check();

    await expect(page.getByText('No results were found')).toBeVisible();

    await searchPage.clearAllFilters().click();

    await expect(searchPage.classificationFilterSelected('CTEP')).toBeHidden();
    expect(await searchPage.registrationStatusFilterInput('Qualified').isChecked()).toBeFalsy();
    expect(await searchPage.dataTypeFilterInput('Number').isChecked()).toBeFalsy();

    await expect(page.getByText('Search CDEs')).toBeVisible();
});
