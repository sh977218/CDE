import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import cdeTinyId from '../../../data/cde-tinyId';
import formTinyId from '../../../data/form-tinyId';

const retiredStatus = 'Retired';

test.describe(`Edit registration status`, async () => {
    test.describe(`unclassified only see 2 status`, async () => {
        test(`CDE page`, async ({ cdePage, navigationMenu }) => {
            const cdeName = 'UnclassifiedCDE';
            await cdePage.goToCde(cdeTinyId[cdeName]);
            await navigationMenu.login(user.nlm.username, user.nlm.password);
        });

        test(`Form page`, async ({ formPage, navigationMenu }) => {
            const formName = 'UnclassifiedForm';
            await formPage.goToForm(formTinyId[formName]);
            await navigationMenu.login(user.nlm.username, user.nlm.password);
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
            await cdePage.goToCde(cdeTinyId[cdeName]);
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await generateDetailsSection.editRegistrationStatusButton().click();
            await generateDetailsSection.editRegistrationStatus({ status: retiredStatus });
            await expect(cdePage.alerts()).toContainText('This data element is retired.');
        });

        test(`Form page`, async ({ formPage, generateDetailsSection, navigationMenu }) => {
            const formName = 'Form Status Test';
            await formPage.goToForm(formTinyId[formName]);
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await generateDetailsSection.editRegistrationStatusButton().click();
            await generateDetailsSection.editRegistrationStatus({ status: retiredStatus });
            await expect(formPage.alerts()).toContainText('This form is retired.');
        });
    });
});
