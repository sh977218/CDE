import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Endorsed organization display first`, async ({
    page,
    materialPage,
    navigationMenu,
    settingMenu,
    searchPage,
    manageOrganizationsPage,
}) => {
    await test.step(`Login with NLM`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Already endorsed organization display first`, async () => {
        await navigationMenu.gotoCdeSearch();
        await expect(searchPage.organizationTitleLink().first()).toHaveText('caBIG');
        await expect(searchPage.organizationTitleLink().nth(1)).toHaveText('caCORE');
        await expect(searchPage.organizationTitleLink().nth(2)).toHaveText('ACRIN');
    });

    await test.step(`Endorse 'TEST'`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.manageOrganizationsMenu().click();
        const managedOrganizationsLocator = manageOrganizationsPage.managedOrganizations(`TEST`);
        await materialPage.toggleMatSlide(managedOrganizationsLocator, 'on');
        await materialPage.checkAlert(`Saved`);
    });

    await test.step(`Verify endorsed organization display first`, async () => {
        await navigationMenu.gotoCdeSearch();

        await expect(searchPage.organizationTitleLink().first()).toHaveText('caBIG');
        await expect(searchPage.organizationTitleLink().nth(1)).toHaveText('caCORE');
        await expect(searchPage.organizationTitleLink().nth(2)).toHaveText('TEST');

        await expect(searchPage.organizationTitleLink().first()).toHaveText('caBIG');
        await expect(searchPage.organizationTitleLink().nth(1)).toHaveText('caCORE');
        await expect(searchPage.organizationTitleLink().nth(2)).toHaveText('TEST');
    });
});
