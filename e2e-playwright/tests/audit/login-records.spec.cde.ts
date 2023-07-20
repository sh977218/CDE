import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Login Records`, async () => {
    test(`Check login recorded`, async ({ page, basePage, navigationMenu, auditTab, loginRecordAuditPage }) => {
        await basePage.goToHome();
        const now = new Date();
        const date = now.toLocaleDateString('en-us', { dateStyle: 'medium' });
        const time = now.toLocaleTimeString('en-US', { timeStyle: 'short' });
        const timestamp = `${date}, ${time}`;
        await navigationMenu.login(user.loginrecorduser.username, user.loginrecorduser.password);
        await navigationMenu.gotoAudit();
        await auditTab.loginRecordsAudit().click();
        await expect(
            await loginRecordAuditPage.findLoginRecordByUser(user.loginrecorduser.username).first()
        ).toContainText(timestamp);
    });
});
