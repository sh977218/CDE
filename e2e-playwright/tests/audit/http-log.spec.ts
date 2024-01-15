import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Http log`, async () => {
    test(`search log`, async ({ page, homePage, navigationMenu, auditTab, materialPage }) => {
        await homePage.goToHome();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await page.route(`/server/log/httpLogs`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });

        await test.step(`Trigger default search on landing`, async () => {
            await navigationMenu.gotoAudit();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`1 – 50 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Search with date range and ip`, async () => {
            await page.getByLabel('Filter by IP Address').fill('127');
            await materialPage.matDatePicker().click();
            await materialPage.matDatePickerSelectDay(1).click();
            await materialPage.matDatePickerSelectDay(28).click();
            await page.getByRole('button', { name: 'Submit', exact: true }).click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`1 – 50 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Select page size '100'`, async () => {
            await materialPage.paginatorNumberPerPage().click();
            await materialPage.matOption('100').click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`1 – 100 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Go to next page`, async () => {
            await materialPage.paginatorNext().click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`101 – 200 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Sort 'URL' and resets page to '1'`, async () => {
            await materialPage.matSortHeader('URL').click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`1 – 100 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('URL');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Go to next page`, async () => {
            await materialPage.paginatorNext().click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`101 – 200 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('URL');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Search resets page to '1' and sort header to 'Date'`, async () => {
            await page.getByLabel('Filter by IP Address').fill('127.0.0.1');
            await page.getByRole('button', { name: 'Submit', exact: true }).click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            test.expect(await page.locator(`cde-http-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(`1 – 100 of`);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });
    });
});
