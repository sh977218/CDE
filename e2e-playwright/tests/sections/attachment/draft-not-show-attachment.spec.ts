import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Draft does not show attachment`, async () => {
    test(`CDE page`, async ({ page, navigationMenu, attachmentSection }) => {
        const cdeName = 'Draft Cde Test';

        await test.step(`Navigate to CDE`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeHidden();
        });

        await test.step(`not show attachment`, async () => {
            await expect(attachmentSection.attachmentNotAvailableMessage()).toHaveText(
                'Attachments are not available in Drafts. Click the Draft slider above to view the current Published version.'
            );
        });
    });
    test(`Form page`, async ({ page, navigationMenu, attachmentSection }) => {
        const formName = 'Draft Form Test';

        await test.step(`Navigate to CDE`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('button', { name: 'Classify this Form' })).toBeHidden();
        });

        await test.step(`not show attachment`, async () => {
            await expect(attachmentSection.attachmentNotAvailableMessage()).toHaveText(
                'Attachments are not available in Drafts. Click the Draft slider above to view the current Published version.'
            );
        });
    });
});
