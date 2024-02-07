import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Daily Usage Report Log`, async () => {
    test(`Generate daily usage`, async ({ page, navigationMenu, auditTab, materialPage }) => {
        await navigationMenu.login(Accounts.nlm);
        await page.route(`/server/log/dailyUsageReportLogs/*`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });

        await test.step(`click 'Generate' button to see report`, async () => {
            await navigationMenu.gotoAudit();
            await auditTab.dailyUsage().click();
            await page.getByRole('button', { name: 'Generate', exact: true }).click();
            await materialPage.matSpinnerShowAndGone();
            test.expect(await page.locator(`cde-daily-usage`).locator(`table td`).count()).toBeGreaterThan(0);
            await test.expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d{1,2} of \d*/);
            await test.expect(materialPage.matSortedHeader()).toHaveText('Last Date');
            test.expect(await materialPage.matSortedIndicator()).toContain('desc');
        });
    });
});
