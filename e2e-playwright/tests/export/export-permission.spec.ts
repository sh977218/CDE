import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

test.describe(`Not logged in can't export`, async () => {
    test(`form search`, async ({ page, navigationMenu }) => {
        await navigationMenu.gotoFormSearch();
        await page.locator('#export').click();
        await expect(page.getByText('Please login to export forms.')).toBeVisible();
    });
    test(`form search result`, async ({ page, navigationMenu, searchPage }) => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchWithString(`"Unified Parkinson's"`);
        await page.locator('#export').click();
        await expect(page.getByText('Please login to export forms.')).toBeVisible();
    });
    test(`form view`, async ({ page, navigationMenu }) => {
        const formName = `McGill Quality of Life Questionnaire (MQOL)`;
        await navigationMenu.gotoFormByName(formName);
        await page.locator('#export').click();
        await expect(page.getByText('Please login to export forms.')).toBeVisible();
    });
});
