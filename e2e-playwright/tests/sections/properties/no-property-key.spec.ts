import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`no property key`, async () => {
    test.beforeEach(async ({ navigationMenu }) => {
        await navigationMenu.login(Accounts.nlm);
    });
    test(`CDE`, async ({ navigationMenu }) => {
        const cdeName = 'Neoadjuvant Therapy';
        await navigationMenu.gotoCdeByName(cdeName, true);
    });

    test(`Form`, async ({ navigationMenu }) => {
        const formName = 'Acute Admission/Discharge';
        await navigationMenu.gotoFormByName(formName, true);
    });

    test.afterEach(async ({ page, materialPage }) => {
        await page.getByRole('button', { name: `Add Property`, exact: true }).click();
        await materialPage.checkAlert(
            'No valid property keys present, have an Org Admin go to Org Management > List Management to add one'
        );
    });
});
