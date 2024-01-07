import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import cdeTinyId from '../../../data/cde-tinyId';
import formTinyId from '../../../data/form-tinyId';

test.describe(`Identifiers`, async () => {
    test(`Cde identifiers always visible`, async ({ page, searchPage, cdePage, navigationMenu }) => {
        await searchPage.goToSearch('cde');
        const cdeName = 'First Name of Participant';
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();

        await searchPage.goToSearch('cde');
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();
    });

    test(`Form identifiers always visible`, async ({ page, searchPage, formPage, navigationMenu }) => {
        await searchPage.goToSearch('form');
        const formName = 'AED Resistance Log';
        await formPage.goToForm(formTinyId[formName]);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();

        await searchPage.goToSearch('cde');
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await formPage.goToForm(formTinyId[formName]);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();
    });
});
