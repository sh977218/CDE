import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Login Records`, async () => {
    test(`Check login recorded`, async ({ homePage, navigationMenu, auditTab, loginRecordAuditPage }) => {
        await homePage.goToHome();
        const now = new Date();
        await navigationMenu.login(user.loginrecorduser.username, user.loginrecorduser.password);
        await navigationMenu.gotoAudit();
        await auditTab.loginRecords().click();
        const recordTimestamp = await loginRecordAuditPage
            .findLatestLoginRecordByUser(user.loginrecorduser.username)
            .innerText();
        const timeDiff = new Date(recordTimestamp).getMinutes() - now.getMinutes();
        expect(timeDiff).toBeGreaterThanOrEqual(0);
    });
});
