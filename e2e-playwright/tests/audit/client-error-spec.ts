import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Client log`, async () => {
    test(`client error log`, async ({ page, homePage, searchPage, navigationMenu, auditTab, materialPage }) => {
        await test.step(`Go to 'client error' and not see any client error`, async () => {
            await homePage.goToHome();
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await navigationMenu.gotoAudit();
            await page.route(`/server/log/clientErrors`, async route => {
                await page.waitForTimeout(5000);
                await route.continue();
            });
            await auditTab.clientErrors().click();
            await materialPage.matSpinner().waitFor();
            await materialPage.matSpinner().waitFor({ state: 'hidden' });
            expect(await page.locator(`cde-client-error`).locator(`table td`).count()).toBeGreaterThan(0);
        });
    });
});
