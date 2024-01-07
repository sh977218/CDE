import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { button } from '../../pages/util';

test.describe(`Submission Manage`, async () => {
    test.beforeEach(async ({ page, homePage, navigationMenu, submissionManagePage }) => {
        await homePage.goToHome();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await navigationMenu.gotoSubmissions();
        await submissionManagePage.isSubmissionManagement();
    });

    test('Filter', async ({ page, submissionManagePage }) => {
        await button(page, 'Filters').click();
        await button(page, 'Submitting Org').click();
        await page.getByLabel('NINDS').click();
        await expect(submissionManagePage.badge('NINDS')).toBeVisible();
        await submissionManagePage.tableResults(2);
    });

    test(`Pagination`, async ({ page, materialPage, submissionManagePage }) => {
        await materialPage.paginatorNumberPerPage().click();
        await materialPage.matOption('10').click();
        await page.getByText('1 - 10 of').isVisible();
        await expect(submissionManagePage.tableCell('g12')).toHaveCount(0);
        await materialPage.paginatorNext().click();
        await expect(page.getByText('g12')).toBeVisible();
    });

    test('Search', async ({ page, submissionManagePage }) => {
        await page.getByPlaceholder('Enter Search Terms Here').fill('g12');
        await page.getByPlaceholder('Enter Search Terms Here').press('Enter');
        await expect(submissionManagePage.badge('g12')).toBeVisible();
        await expect(submissionManagePage.tableCell('g12')).toBeVisible();
        await expect(submissionManagePage.tableCell('NINDS')).not.toBeVisible();
        await submissionManagePage.tableResults(1);

        await submissionManagePage.badge('g12').click();
        await expect(submissionManagePage.badge('g12')).not.toBeVisible();
        await expect(submissionManagePage.tableCell('g12')).toBeVisible();
        await expect(submissionManagePage.tableCell('NINDS').first()).toBeVisible();
        await submissionManagePage.tableResultsAtLeast(10);
    });

    test('Show/Hide Columns', async ({ page, submissionManagePage }) => {
        await expect(submissionManagePage.tableCell('Organization URL')).not.toBeVisible();
        await button(page, 'Show/Hide Columns').click();
        await expect(page.locator('.contentPane')).toContainText('Column Options');
        await page.getByLabel('Organization URL').check();
        await expect(submissionManagePage.tableHeading('Organization URL')).toBeVisible();
        await expect(submissionManagePage.tableCell('https://ninds.gov')).toBeVisible();
    });

    test('Sort Column', async ({ page, submissionManagePage }) => {
        // Collection Title column
        await expect(submissionManagePage.tableRows().nth(1).locator('.cell').nth(1)).toContainText('NINDS');
        await expect(submissionManagePage.tableRows().nth(2).locator('.cell').nth(1)).toContainText('bbb');
        await expect(submissionManagePage.tableRows().nth(3).locator('.cell').nth(1)).toContainText('ccc');

        await submissionManagePage.tableHeading('Collection Title').locator('mat-icon').click();
        await expect(submissionManagePage.tableRows().nth(1).locator('.cell').nth(1)).toContainText('AI');
        await expect(submissionManagePage.tableRows().nth(2).locator('.cell').nth(1)).toContainText('NINDS');
        await expect(submissionManagePage.tableRows().nth(3).locator('.cell').nth(1)).toContainText('NLM');
    });

    test('View Submission', async ({ page, submissionManagePage }) => {
        await submissionManagePage.tableAction(0).click();
        await button(submissionManagePage.tableActionMenu(), 'View').click();
        await expect(page.locator('mat-dialog-container')).toBeVisible();
        await expect(page.getByPlaceholder('Ex. Topic Collection 1')).toHaveValue('NINDS');
        await expect(page.getByPlaceholder('Ex. Topic Collection 1')).toBeDisabled();
        await expect(button(page, 'Save')).toHaveCount(0);
    });
});
