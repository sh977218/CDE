import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Create form from board`, async ({
    page,
    materialPage,
    navigationMenu,
    myBoardPage,
    previewSection,
    generateDetailsSection,
}) => {
    const boardName = `Form Board`;

    const cdeName1 = `cdeCompare1`;
    const cdeName2 = `cdeCompare2`;

    const formName = `New form from boards`;
    const formDef = 'New form from boards definition';

    const newOrg = 'TEST';
    const classificationArray = ['Eligibility Criteria', 'LABS'];

    await test.step(`Login and goto board`, async () => {
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();
    });
    await test.step(`create form`, async () => {
        await page.getByRole(`button`, { name: 'Create Form', exact: true }).click();
        await expect(page.locator(`[id="submit"]`)).toBeDisabled();
        await page.locator(`[id="eltName"]`).fill(formName);
        await page.locator(`[id="eltDefinition"]`).fill(formDef);
        await page.locator(`[id="eltStewardOrgName"]`).selectOption(newOrg);
        await page.locator(`[id="openClassificationModalBtn"]`).click();
        await materialPage.classifyItemByOrgAndCategories(newOrg, classificationArray);
        await page.locator(`[id="submit"]`).click();
    });

    await test.step(`Verify CDE in the forms just created`, async () => {
        await expect(generateDetailsSection.registrationStatus()).toHaveText(`Incomplete`);
        await expect(previewSection.previewDiv().getByText(cdeName1)).toBeVisible();
        await expect(previewSection.previewDiv().getByText(cdeName2)).toBeVisible();
    });
});
