import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Draft does not show classification`, async () => {
    test(`CDE page`, async ({ page, navigationMenu, classificationSection }) => {
        const cdeName = 'Draft Cde Test';

        await test.step(`Navigate to CDE`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeHidden();
        });

        await test.step(`not show classification`, async () => {
            await expect(classificationSection.classificationNotAvailableMessage()).toHaveText(
                'Classification is not available in Drafts. Click the Draft slider above to view the current Published version.'
            );
        });
    });
});
