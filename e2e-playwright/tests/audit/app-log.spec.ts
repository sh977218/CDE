import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`App log`, async () => {
    test(`search app log`, async ({ page, navigationMenu, auditTab, materialPage }) => {
        await navigationMenu.login(Accounts.nlm);
        await page.route(`/server/log/appLogs`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await navigationMenu.gotoAudit();
        await auditTab.appLogs().click();
        await test.expect(page.locator(`cde-app-log table tbody tr`)).toHaveCount(0);

        await test.step(`Search with date range and ip`, async () => {
            await materialPage.matDatePicker(page.locator(`[data-testid="app-log-date-picker-toggle"]`)).click();
            await page.click('.mat-calendar-previous-button');
            await materialPage.matDatePickerSelectDay(1).click();
            await materialPage.matDatePickerSelectDay(28).click();
            await page.getByRole('button', { name: 'Submit', exact: true }).click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Select page size '100'`, async () => {
            await materialPage.paginatorNumberPerPage().click();
            await materialPage.matOptionByText('100').click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`Go to next page`, async () => {
            await materialPage.paginatorNext().click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/\d* – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });

        await test.step(`click sort header 'URL' and resets page to '1' sort direction to 'asc'`, async () => {
            await materialPage.matSortHeader('Level').click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Level');
            test.expect(await materialPage.matSortedIndicator()).toContain('asc');
        });

        await test.step(`Go to next page`, async () => {
            await materialPage.paginatorNext().click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Level');
            test.expect(await materialPage.matSortedIndicator()).toContain('asc');
        });

        await test.step(`Search resets page to '1' and sort header to 'Date'`, async () => {
            await page.getByRole('button', { name: 'Submit', exact: true }).click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-app-log`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Level');
            test.expect(await materialPage.matSortedIndicator()).toContain('asc');
        });
    });
});
