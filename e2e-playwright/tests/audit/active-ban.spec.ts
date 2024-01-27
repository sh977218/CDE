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
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        const recordCountBefore = await page.locator(`cde-active-ban`).locator(`table tbody tr`).count();
        expect(recordCountBefore).toBeGreaterThan(0);
        await expect(materialPage.paginatorRangeLabel()).toContainText(/1 – \d* of \d*/);
        await expect(materialPage.matSortedHeader()).toHaveText('Date');
        expect(await materialPage.matSortedIndicator()).toContain('desc');

        await test.step(`Remove first ban`, async () => {
            await page.locator(`cde-active-ban table tbody tr`).first().getByRole('button').click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            const recordCountAfter = await page.locator(`cde-active-ban`).locator(`table tbody tr`).count();
            expect(recordCountAfter).toBeLessThan(recordCountBefore);
        });
    });
});
