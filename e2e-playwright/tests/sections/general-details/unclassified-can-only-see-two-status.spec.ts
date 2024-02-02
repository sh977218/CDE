import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';

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
