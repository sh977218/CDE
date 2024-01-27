import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Login Records`, async () => {
    test(`Check login recorded`, async ({
        page,

        materialPage,
        navigationMenu,
        auditTab,
        loginRecordAuditPage,
    }) => {
        const now = new Date();
        await navigationMenu.login(Accounts.loginrecorduser);
        await navigationMenu.gotoAudit();
        await page.route(`/server/log/loginRecords`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await auditTab.loginRecords().click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        const recordTimestamp = await loginRecordAuditPage
            .findLatestLoginRecordByUser(Accounts.loginrecorduser.username)
            .innerText();
        const timeDiff = new Date(recordTimestamp).getMinutes() - now.getMinutes();
        expect(timeDiff).toBeGreaterThanOrEqual(0);
    });
});
