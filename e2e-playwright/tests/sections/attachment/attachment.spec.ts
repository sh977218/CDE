import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test.describe(`Attachment`, async () => {
    test.describe(`CDE page`, async () => {
        test.beforeEach(async ({ navigationMenu }) => {
            const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
            await navigationMenu.gotoCdeByName(cdeName);
        });
        test(`Anonymous user`, async ({ attachmentSection }) => {
            await expect(attachmentSection.uploadMoreFile()).toBeHidden();
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

    test.describe(`upload attachment and show in search result`, async () => {
        test.beforeEach(async ({ navigationMenu }) => {
            await navigationMenu.login(Accounts.nlm);
        });

        test(`CDE set default attachment`, async ({ navigationMenu, attachmentSection, searchPage }) => {
            const cdeName = `Geriatric Depression Scale (GDS) - life satisfaction indicator`;
            await navigationMenu.gotoCdeByName(cdeName);
            await attachmentSection.uploadAttachment('./e2e-playwright/assets/painLocationInapr.png');
            await attachmentSection.setDefaultAttachmentByIndex(0);

            await navigationMenu.gotoCdeSearch();
            await searchPage.searchWithString(cdeName);
            await expect(searchPage.searchResultList().locator('img')).toHaveAttribute(
                'src',
                /\/server\/system\/data\/\d+/
            );
        });

        test(`Form set default attachment`, async ({ navigationMenu, attachmentSection, searchPage }) => {
            const formName = `Pre-Hospital/Emergency Medical Service (EMS) Course`;
            await navigationMenu.gotoFormByName(formName);
            await attachmentSection.uploadAttachment('./e2e-playwright/assets/painLocationInapr.png');
            await attachmentSection.setDefaultAttachmentByIndex(0);

            await navigationMenu.gotoFormSearch();
            await searchPage.searchWithString(formName);
            await expect(searchPage.searchResultList().locator('img')).toHaveAttribute(
                'src',
                /\/server\/system\/data\/\d+/
            );
        });
    });
});
