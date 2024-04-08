import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Org specific roles can see 'Candidate', 'Incomplete', 'Recorded'`, async () => {
    test.beforeEach(async ({ navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await test.step(`Not logged in user do not see status 'Retired', 'Recorded', 'Candidate', 'Incomplete'`, async () => {
            await expect(searchPage.registrationStatusFilterInput('Retired')).toBeHidden();
            await expect(searchPage.registrationStatusFilterInput('Recorded')).toBeHidden();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeHidden();
            await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeHidden();
        });
        await test.step(`Not logged in user do see 'Standard', 'Qualified'`, async () => {
            await expect(searchPage.registrationStatusFilterInput('Standard')).toBeVisible();
            await expect(searchPage.registrationStatusFilterInput('Qualified')).toBeVisible();
        });
    });

    test(`'acrin' (OrgCurator) can see ACRIN all registration status regardless of their role`, async ({
        page,
        materialPage,
        navigationMenu,
        searchPage,
        settingMenu,
    }) => {
        await navigationMenu.login(Accounts.acrin);
        await searchPage
            .organizationTitleLink()
            .filter({ hasText: /^ACRIN$/ })
            .click();
        await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible();
        await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeVisible();

        await test.step(`'acrin' can not see other organization' all registration status`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeHidden();
            await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeHidden();
        });

        await test.step(`Enable view draft can see all status`, async () => {
            await navigationMenu.gotoSettings();
            await settingMenu.searchSettingsMenu().click();
            await page.locator(`id=viewPublishAndDraftButton-input`).check();
            await materialPage.checkAlert('Saved');

            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible();
        });
    });

    test(`'cabigEditor' (orgEditor) can see caBIG all registration status regardless of their role`, async ({
        page,
        materialPage,
        navigationMenu,
        searchPage,
        settingMenu,
    }) => {
        await navigationMenu.login(Accounts.cabigEditor);
        await searchPage.organizationTitleLink().filter({ hasText: `caBIG` }).click();
        await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible();
        await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeVisible();

        await test.step(`'cabigEditor' can not see other organization' all registration status`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible(); //because CCR has 1 overlap with caBIG
            await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeHidden();
        });
        await test.step(`Enable view draft can see all status`, async () => {
            await navigationMenu.gotoSettings();
            await settingMenu.searchSettingsMenu().click();
            await page.locator(`id=viewPublishAndDraftButton-input`).check();
            await materialPage.checkAlert('Saved');

            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible();
        });
    });

    test(`'ctepAdmin' (orgAdmin) can see CTEP all registration status regardless of their role`, async ({
        page,
        materialPage,
        navigationMenu,
        searchPage,
        settingMenu,
    }) => {
        await navigationMenu.login(Accounts.ctepAdmin);
        await searchPage.organizationTitleLink().filter({ hasText: `CTEP` }).click();
        await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeVisible();

        await test.step(`'ctepAdmin' can not see other organization' all registration status`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeHidden();
            await expect(searchPage.registrationStatusFilterInput('Incomplete')).toBeHidden();
        });
        await test.step(`Enable view draft can see all status`, async () => {
            await navigationMenu.gotoSettings();
            await settingMenu.searchSettingsMenu().click();
            await page.locator(`id=viewPublishAndDraftButton-input`).check();
            await materialPage.checkAlert('Saved');

            await navigationMenu.gotoCdeSearch();
            await searchPage.organizationTitleLink().filter({ hasText: `CCR` }).click();
            await expect(searchPage.registrationStatusFilterInput('Candidate')).toBeVisible();
        });
    });
});
