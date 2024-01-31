import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Create Form`, async ({ page, materialPage, createEltPage, navigationMenu }) => {
    const formName = 'nlm curated form';
    const formDef = 'create by NLM Curator';

    const formOrg1 = 'SeleniumOrg';
    const formCategories1 = ['Test Classif'];

    const formOrg2 = 'NINDS';
    const formCategories2 = ['Population', 'Adult'];

    await test.step(`Login and go to create form`, async () => {
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoCreateForm();
    });

    await test.step(`Create form`, async () => {
        await expect(createEltPage.submitButton()).toBeDisabled();
        await expect(createEltPage.validationError()).toContainText(`Please enter a name for the new Form`);

        await createEltPage.eltNameInput().fill(formName);
        await expect(createEltPage.validationError()).toContainText(`Please enter a definition for the new Form`);

        await createEltPage.eltDefinitionInput().fill(formDef);
        await expect(createEltPage.validationError()).toContainText(`Please select a steward for the new Form`);

        await createEltPage.eltStewardOrgNameSelect().selectOption(formOrg1);
        await expect(createEltPage.validationError()).toContainText(`Please select at least one classification`);

        await createEltPage.openClassifyModalButton().click();
        await materialPage.classifyItemByOrgAndCategories(formOrg1, formCategories1);

        await createEltPage.openClassifyModalButton().click();
        await materialPage.classifyItemByOrgAndCategories(formOrg2, formCategories2);

        await expect(createEltPage.validationError()).toBeHidden();
        await createEltPage.submitButton().click();
    });

    await test.step(`Verify form`, async () => {
        expect(await page.getByRole('button', { name: 'Edit', exact: true }).count()).toBeGreaterThanOrEqual(0);
    });
});
