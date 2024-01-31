import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Create CDE`, async ({ page, materialPage, createEltPage, classificationSection, navigationMenu }) => {
    const cdeName = 'nlm curated data element';
    const cdeDef = 'create by NLM Curator';

    const cdeOrg1 = 'SeleniumOrg';
    const cdeCategories1 = ['Test Classif'];

    const cdeOrg2 = 'NINDS';
    const cdeCategories2 = ['Population', 'Adult'];

    await test.step(`Login and go to create CDE`, async () => {
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoCreateCde();
    });
    await test.step(`Create CDE`, async () => {
        await expect(createEltPage.submitButton()).toBeDisabled();
        await expect(createEltPage.validationError()).toContainText(`Please enter a name for the new CDE`);

        await createEltPage.eltNameInput().fill(cdeName);
        await expect(createEltPage.validationError()).toContainText(`Please enter a definition for the new CDE`);

        await createEltPage.eltDefinitionInput().fill(cdeDef);
        await expect(createEltPage.validationError()).toContainText(`Please select a steward for the new CDE`);

        await createEltPage.eltStewardOrgNameSelect().selectOption(cdeOrg1);
        await expect(createEltPage.validationError()).toContainText(`Please select at least one classification`);

        await createEltPage.openClassifyModalButton().click();
        await materialPage.classifyItemByOrgAndCategories(cdeOrg1, cdeCategories1);

        await createEltPage.openClassifyModalButton().click();
        await materialPage.classifyItemByOrgAndCategories(cdeOrg2, cdeCategories2);

        await expect(createEltPage.validationError()).toBeHidden();
        await createEltPage.submitButton().click();
    });

    await test.step(`Verify CDE`, async () => {
        expect(await page.getByRole('button', { name: 'Edit', exact: true }).count()).toBeGreaterThanOrEqual(0);
    });
});
