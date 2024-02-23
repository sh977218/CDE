import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';

test.describe(`Server log`, async () => {
    const badSearchInput = `some very bad input &*(`;
    const serverErrorMessage = `ReferenceError: trigger is not defined`;
    test(`server error log`, async ({ page, searchPage, navigationMenu, auditTab, materialPage }) => {
        await test.step(`Go to 'server error' and not see server error`, async () => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoAudit();
            await auditTab.serverErrors().click();
            await page.route(`/server/log/serverErrors`, async route => {
                await page.waitForTimeout(5000);
                await route.continue();
            });
            await test.expect(page.getByText(badSearchInput)).toBeHidden();
            await test.expect(page.getByText(serverErrorMessage)).toBeHidden();
        });

        await test.step(`Trigger server error`, async () => {
            const newPage = await page.context().newPage();
            await newPage.goto(`/server/log/triggerServerErrorExpress`);
            await test.expect(newPage.getByText('received')).toBeVisible();
            await newPage.close();
        });

        await test.step(`Trigger bad input error`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchWithString(badSearchInput, 0);
        });

        await test.step(`Go to 'server error'`, async () => {
            await navigationMenu.gotoAudit();
            await auditTab.serverErrors().click();
        });

        await test.step(`Without checkbox unchecked and not see bad input error`, async () => {
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-server-error`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
            await test.expect(page.getByText(badSearchInput)).toBeHidden();
            await test.expect(page.getByText(serverErrorMessage)).toBeVisible();
        });

        await test.step(`With checkbox checked and see bad input error`, async () => {
            await page.locator(`[data-testid="include-bad-input-checkbox"] input`).check();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-server-error`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
            await test.expect(page.getByText(badSearchInput)).toBeVisible();
            await test.expect(page.getByText(serverErrorMessage)).toBeVisible();
        });
    });
});
