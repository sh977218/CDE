import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Server log`, async () => {
    const badSearchInput = `some very bad input &*(`;
    const serverErrorMessage = `ReferenceError: trigger is not defined`;
    test(`server error log`, async ({ page, homePage, searchPage, navigationMenu, auditTab, materialPage }) => {
        await test.step(`Go to 'server error' and not see any server error`, async () => {
            await homePage.goToHome();
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await navigationMenu.gotoAudit();
            await auditTab.serverErrors().click();
            await page.route(`/server/log/serverErrors`, async route => {
                await page.waitForTimeout(5000);
                await route.continue();
            });
        });

        await test.step(`trigger server error and see the error`, async () => {
            const newPage = await page.context().newPage();
            await newPage.goto(`/server/log/triggerServerErrorExpress`);
            await test.expect(newPage.getByText('received')).toBeVisible();
            await newPage.close();

            await page.getByRole('button', { name: 'Search', exact: true }).click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            await test.expect(page.getByText(serverErrorMessage).first()).toBeVisible();
        });

        await test.step(`bad input search`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchQueryInput().fill(badSearchInput);
            await searchPage.searchSubmitButton().click();
            await expect(page.getByText('No results were found.')).toBeVisible();
        });

        await test.step(`Go to 'server error'`, async () => {
            await navigationMenu.gotoAudit();
            await auditTab.serverErrors().click();
        });

        await test.step(`Search without user bad input`, async () => {
            await page.getByRole('button', { name: 'Search', exact: true }).click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-server-error`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
            await test.expect(page.getByText(badSearchInput)).toBeHidden();
            await test.expect(page.getByText(serverErrorMessage).first()).toBeVisible();
        });

        await test.step(`Search with user bad input`, async () => {
            await page.locator(`[data-testid="include-bad-input-checkbox"] input`).check();
            await page.getByRole('button', { name: 'Search', exact: true }).click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-server-error`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
            await test.expect(page.getByText(badSearchInput).first()).toBeVisible();
            await test.expect(page.getByText(serverErrorMessage).first()).toBeVisible();
        });
    });
});
