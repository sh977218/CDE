import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Active ban log`, async ({ page, navigationMenu, auditTab, materialPage }) => {
    await navigationMenu.login(Accounts.nlm);
    await page.route(`server/system/activeBans`, async route => {
        await page.waitForTimeout(5000);
        await route.continue();
    });
    await page.route(`server/system/removeBan`, async route => {
        await page.waitForTimeout(5000);
        await route.continue();
    });

    await test.step(`Show report automatically and remove record`, async () => {
        await navigationMenu.gotoAudit();
        await auditTab.activeBans().click();
        await materialPage.matSpinnerShowAndGone();
        await expect(
            page.locator(`cde-active-ban`).getByText('wp-content/plugins/core-plugin/include.php')
        ).toBeVisible();
        await expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
        await expect(materialPage.matSortedHeader()).toHaveText('Date');
        expect(await materialPage.matSortedIndicator()).toContain('desc');

        await test.step(`Remove first ban`, async () => {
            await page.locator(`cde-active-ban table tbody tr`).first().getByRole('button').click();
            await materialPage.matSpinnerShowAndGone();
            await expect(
                page.locator(`cde-active-ban`).getByText('wp-content/plugins/core-plugin/include.php')
            ).toBeHidden();
        });
    });
});
