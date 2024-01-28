import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Create Form`, async ({ page, classificationSection, navigationMenu }) => {
    const formName = 'nlm curated data element';
    const formDef = 'create by NLM Curator';
    const formOrg = 'SeleniumOrg';
    const formCategories = ['Test Classif'];

    await test.step(`Login and go to create form`, async () => {
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoCreateForm();
    });

    await test.step(`Create form`, async () => {
        await expect(page.locator(`[id="submit"]`)).toBeDisabled();
        await page.getByText(`Please enter a name for the new form`).waitFor();

        await page.locator(`[id="eltName"]`).fill(formName);
        await page.getByText(`Please enter a definition for the new form`).waitFor();

        await page.locator(`[id="eltDefinition"]`).fill(formDef);
        await page.getByText(`Please select a steward for the new form`).waitFor();

        await page.locator(`[id="eltStewardOrgName"]`).selectOption(formOrg);
        await page.getByText(`Please select at least one classification`).waitFor();

        await page.locator(`[id="openClassificationModalBtn"]`).click();
        await classificationSection.classifyItemByOrgAndCategories(formOrg, formCategories);

        await page.locator(`[id="openClassificationModalBtn"]`).click();
        await classificationSection.classifyItemByOrgAndCategories('NINDS', ['Population', 'Adult']);

        await expect(page.getByText(`Please`)).toBeHidden();
        await page.locator(`[id="submit"]`).click();
    });

    await test.step(`Verify form`, async () => {
        expect(await page.getByRole('button', { name: 'Edit', exact: true }).count()).toBeGreaterThanOrEqual(0);
    });
});
