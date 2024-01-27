import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';

test.describe(`Attachment`, async () => {
    test.describe(`CDE page`, async () => {
        test.beforeEach(async ({ navigationMenu }) => {
            const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
            await navigationMenu.gotoCdeByName(cdeName);
        });
        test(`Anonymous user`, async ({ attachmentSection }) => {
            expect(await attachmentSection.uploadMoreFile.isVisible()).toBeFalsy();
        });
        test(`Logged in user`, async ({ attachmentSection, aioTocViewMenu, navigationMenu }) => {
            await navigationMenu.login(Accounts.nlm);
            await aioTocViewMenu.goToAttachments();
            await attachmentSection.uploadAttachment(`./e2e-playwright/assets/glass.jpg`);
            const attachmentLocator = attachmentSection.attachments().first();
            expect(await attachmentLocator.isVisible()).toBeTruthy();
            await attachmentSection.removeAttachment(attachmentLocator);
            expect(await attachmentLocator.isVisible()).toBeFalsy();
        });
    });
});
