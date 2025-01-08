import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Submission information`, async () => {
    test(`CDE page`, async ({ page, navigationMenu, submissionInformationSection }) => {
        const cdeName = 'Patient Gender Code';

        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
        });
        await test.step(`Verify submission information`, async () => {
            const sourceContainer = submissionInformationSection.sourceContainer();
            await expect(sourceContainer).toContainText('Name:caDSR');
            await expect(sourceContainer).toContainText('Created:12/10/1994');
            await expect(sourceContainer).toContainText('Updated:10/17/2016');
            await expect(sourceContainer).toContainText('Registration Status:standard');
            await expect(sourceContainer).toContainText('Datatype:Number');
            await expect(sourceContainer).toContainText('Copyright:Terms of Use');

            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                sourceContainer.getByRole('link', { name: 'Terms of Use' }).click(),
            ]);

            await expect(newPage).toHaveURL('https://loinc.org/kb/license/');
        });
    });
});
