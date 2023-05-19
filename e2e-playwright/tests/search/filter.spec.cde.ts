import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Search Filter`, async () => {
    test(`Clear all filters`, async ({basePage, searchPage, navigationMenu}) => {
        await basePage.goToSearch('cde');
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await searchPage.browseOrg('CTEP').click();
        await searchPage.addClassificationFilter('CATEGORY').click();
        await expect(searchPage.findSearchPageText('AdEERS')).toBeVisible();
        await searchPage.altClassificationFilterModeToggle().click();
        await expect(searchPage.findSearchPageText('(Select Orgs)')).toBeVisible();
        await searchPage.addClassificationFilter('CTEP').click();
        await searchPage.addClassificationFilter('DISEASE').click();
        await expect(searchPage.findSearchPageText('Bladder (8)')).toBeVisible();

        await searchPage.addRegStatusFilter('Qualified').click();
        await searchPage.addDataTypeFilter('Number').click();

        await expect(searchPage.classificationFilterSelected('CTEP', true)).toBeVisible();
        await expect(searchPage.classificationFilterSelected('DISEASE', true)).toBeVisible();
        expect(await searchPage.regStatusFilterSelected('Qualified').isChecked()).toBeTruthy();
        expect(await searchPage.dataTypeFilterSelected('Number').isChecked()).toBeTruthy();

        await expect(searchPage.findSearchPageText('4 results')).toBeVisible();

        await searchPage.nihEndorsedToggle().click();

        await expect(searchPage.findSearchPageText('No results were found')).toBeVisible();

        await searchPage.clearAllFilters().click();

        await expect(searchPage.classificationFilterSelected('CTEP', false)).toBeVisible();
        expect(await searchPage.regStatusFilterSelected('Qualified').isChecked()).toBeFalsy();
        expect(await searchPage.dataTypeFilterSelected('Number').isChecked()).toBeFalsy();

        await expect(searchPage.findSearchPageText('Search CDEs')).toBeVisible();
    })

});
