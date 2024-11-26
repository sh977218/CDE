import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Identifiers`, async () => {
    test(`Cde identifiers always visible`, async ({ page, searchPage, cdePage, navigationMenu }) => {
        const cdeName = '36-item Short Form Health Survey (SF-36) - General health score';
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();

        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();
    });

    test(`Form identifiers always visible`, async ({ page, searchPage, formPage, navigationMenu }) => {
        const formName = 'AED Resistance Log';
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();

        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible();
    });
});
