import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';
import { test } from '../../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Form classify all CDEs classification`, async ({ page, navigationMenu, classificationSection }) => {
    const cdeName1 = `Data source`;
    const cdeName2 = `History data reliability type`;
    const formName = 'History Data Source and Reliability';
    const classificationArray = ['TEST', 'Eligibility Criteria', 'LABS'];

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Classification' })).toBeVisible();
        await page.getByRole('heading', { name: 'Classification' }).scrollIntoViewIfNeeded();
        await expect(page.getByText(classificationArray[2])).toBeHidden();
    });

    await test.step(`Classify form`, async () => {
        await classificationSection.addClassificationToCDEs(classificationArray);
    });

    await test.step(`New classification is visible for CDEs`, async () => {
        await navigationMenu.gotoCdeByName(cdeName1);
        await expect(page.getByText(classificationArray[2])).toBeVisible();

        await navigationMenu.gotoCdeByName(cdeName2);
        await expect.soft(page.getByText(classificationArray[2])).toBeVisible();
    });
});
