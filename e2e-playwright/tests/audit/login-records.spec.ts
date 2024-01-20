import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Login Records`, async () => {
    test(`Check login recorded`, async ({
        page,
        homePage,
        materialPage,
        navigationMenu,
        auditTab,
        loginRecordAuditPage,
    }) => {
        await homePage.goToHome();
        const now = new Date();
        await navigationMenu.login(user.loginrecorduser.username, user.loginrecorduser.password);
        await navigationMenu.gotoAudit();
        await page.route(`/server/log/loginRecords`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await auditTab.loginRecords().click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        const recordTimestamp = await loginRecordAuditPage
            .findLatestLoginRecordByUser(user.loginrecorduser.username)
            .innerText();
        const timeDiff = new Date(recordTimestamp).getMinutes() - now.getMinutes();
        expect(timeDiff).toBeGreaterThanOrEqual(0);
    });
});
