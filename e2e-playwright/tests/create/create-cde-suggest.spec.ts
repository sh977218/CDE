import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Create CDE suggest`, async ({ page, materialPage, createEltPage, classificationSection, navigationMenu }) => {
    await test.step(`Login and go to create CDE`, async () => {
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoCreateCde();
    });
    await test.step(`enter CDE name and verify suggest`, async () => {
        await expect(createEltPage.submitButton()).toBeDisabled();
        await expect(createEltPage.validationError()).toContainText(`Please enter a name for the new CDE`);

        await createEltPage.eltNameInput().fill('fad');
        await expect(createEltPage.possibleMatchDiv().locator('h4')).toHaveText(`Possible Matches`);
        await expect(createEltPage.possibleMatchDiv()).toContainText(`Family Assessment Device (FAD)`);
    });
});
