import test from '../../fixtures/base-fixtures';
import cdeTinyId from '../../data/cde-tinyId';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Attachment`, async () => {
    test.describe(`CDE page`, async () => {
        test.beforeEach(async ({cdePage,}) => {
            const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
            await cdePage.goToCde(cdeTinyId[cdeName]);
        })
        test(`Anonymous user`, async ({basePage}) => {
            expect(await basePage.uploadMoreFile.isVisible()).toBeFalsy();
        })
        test(`Logged in user`, async ({basePage, aioTocViewMenu, navigationMenu}) => {
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await aioTocViewMenu.goToAttachments();
            await basePage.uploadAttachment(`./e2e-playwright/assets/glass.jpg`);
            const attachmentLocator = basePage.attachments().first();
            expect(await attachmentLocator.isVisible()).toBeTruthy();
            await basePage.removeAttachment(attachmentLocator);
            expect(await attachmentLocator.isVisible()).toBeFalsy();
        })
    })

    test.describe(`Form page`, async () => {
        test.fixme();
    })
});
