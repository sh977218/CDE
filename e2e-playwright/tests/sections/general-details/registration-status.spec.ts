import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const retiredStatus = 'Retired';

test.describe(`Edit registration status`, async () => {
    test.describe(`unclassified only see 2 status`, async () => {
        test(`CDE page`, async ({ cdePage, navigationMenu }) => {
            const cdeName = 'UnclassifiedCDE';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
        });

        test(`Form page`, async ({ formPage, navigationMenu }) => {
            const formName = 'UnclassifiedForm';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
        });

        test.afterEach(async ({ generateDetailsSection, updateRegistrationStatusModal }) => {
            await generateDetailsSection.editRegistrationStatusButton().click();
            await expect(updateRegistrationStatusModal.helperMessage()).toHaveText(
                `Elements that are not classified (or only classified by TEST can only have Incomplete or Retired status`
            );
            await expect(updateRegistrationStatusModal.registrationStatusOptions()).toHaveCount(2);
        });
    });

    test.describe(`Should allow change status`, async () => {
        test(`CDE page`, async ({ cdePage, generateDetailsSection, navigationMenu }) => {
            const cdeName = 'Cde Status Test';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            await generateDetailsSection.editRegistrationStatus({ status: retiredStatus });
            await expect(cdePage.alerts()).toContainText('This data element is retired.');
        });

        test(`Form page`, async ({ formPage, generateDetailsSection, navigationMenu }) => {
            const formName = 'Form Status Test';
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await generateDetailsSection.editRegistrationStatus({ status: retiredStatus });
            await expect(formPage.alerts()).toContainText('This form is retired.');
        });
    });
});
