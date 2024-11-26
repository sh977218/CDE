import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Edit registration status`, async () => {
    test.describe(`Retired status`, async () => {
        test(`CDE page`, async ({ cdePage, generateDetailsSection, navigationMenu }) => {
            const cdeName = 'Cde Status Test';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            await generateDetailsSection.editRegistrationStatus({ status: 'Retired' });
            await expect(cdePage.alerts()).toContainText('This data element is retired.');
        });

        test(`Form page`, async ({ formPage, generateDetailsSection, navigationMenu }) => {
            const formName = 'Form Status Test';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await generateDetailsSection.editRegistrationStatus({ status: 'Retired' });
            await expect(formPage.alerts()).toContainText('This form is retired.');
        });
    });

    test.describe(`Preferred Standard status`, async () => {
        test(`CDE page`, async ({ navigationMenu, saveModal, searchPage, generateDetailsSection }) => {
            const cdeName = 'Noncompliant Reason Text';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            await generateDetailsSection.editRegistrationStatus({ status: 'Preferred Standard' });
            await saveModal.publishNewVersionByType('cde');

            await navigationMenu.gotoCdeSearch();
            await expect(searchPage.registrationStatusFilter('Preferred Standard')).toBeVisible();
        });

        test(`Form page`, async ({ navigationMenu, saveModal, searchPage, generateDetailsSection }) => {
            const formName = 'PROMIS Parent Proxy SF v1.0 - Upper Extremity 8a';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await generateDetailsSection.editRegistrationStatus({ status: 'Preferred Standard' });
            await saveModal.publishNewVersionByType('form');

            await navigationMenu.gotoFormSearch();
            await expect(searchPage.registrationStatusFilter('Preferred Standard')).toBeVisible();
        });
    });
});
