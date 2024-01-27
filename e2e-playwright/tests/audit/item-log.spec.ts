import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';

test.describe(`Item Log`, async () => {
    test.beforeEach(async ({ navigationMenu }) => {
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.gotoAudit();
    });

    test(`Org Authority can view 'CDE Audit Log'`, async ({ page, materialPage, auditTab }) => {
        await auditTab.cdeAuditLog().click();
        await page.route(`/server/log/itemLog/de`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        await expect(page.locator(`cde-item-log table tbody tr`).first()).toBeVisible();
    });

    test(`Org Authority can view 'Form Audit Log'`, async ({ page, materialPage, auditTab }) => {
        await auditTab.formAuditLog().click();
        await page.waitForTimeout(2000); // wait for tab animation completes.
        await page.route(`/server/log/itemLog/form`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        await expect(page.locator(`cde-item-log table tbody tr`).first()).toBeVisible();
    });
});
