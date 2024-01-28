import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Create CDE`, async ({ page, classificationSection, navigationMenu }) => {
    const cdeName = 'nlm curated data element';
    const cdeDef = 'create by NLM Curator';
    const cdeOrg = 'SeleniumOrg';
    const cdeCategories = ['Test Classif'];

    await test.step(`Login and go to create CDE`, async () => {
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoCreateCde();
    });
    await test.step(`Create CDE`, async () => {
        await expect(page.locator(`[id="submit"]`)).toBeDisabled();
        await page.getByText(`Please enter a name for the new CDE`).waitFor();

        await page.locator(`[id="eltName"]`).fill(cdeName);
        await page.getByText(`Please enter a definition for the new CDE`).waitFor();

        await page.locator(`[id="eltDefinition"]`).fill(cdeDef);
        await page.getByText(`Please select a steward for the new CDE`).waitFor();

        await page.locator(`[id="eltStewardOrgName"]`).selectOption(cdeOrg);
        await page.getByText(`Please select at least one classification`).waitFor();

        await page.locator(`[id="openClassificationModalBtn"]`).click();
        await classificationSection.classifyItemByOrgAndCategories(cdeOrg, cdeCategories);

        await page.locator(`[id="openClassificationModalBtn"]`).click();
        await classificationSection.classifyItemByOrgAndCategories('NINDS', ['Population', 'Adult']);

        await expect(page.getByText(`Please`)).toBeHidden();
        await page.locator(`[id="submit"]`).click();
    });

    await test.step(`Verify CDE`, async () => {
        expect(await page.getByRole('button', { name: 'Edit', exact: true }).count()).toBeGreaterThanOrEqual(0);
    });
});
