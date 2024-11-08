import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Classify form from board`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
    const formName1 = `Participant/Subject Contact Information`;
    const formName2 = `Parkinson's Disease Quality of Life Scale (PDQUALIF)`;
    const formName3 = `ER/Admission Therapeutic Procedures`;

    const boardName = `formOnlyBoard`;
    const boardDefinition = `this board only has forms.`;

    const newOrg = `TEST`;
    const classificationArray = [`Classify Board`];

    await test.step(`Login and create board`, async () => {
        await navigationMenu.login(Accounts.formBoardUser);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.createBoardSuccess({
            boardName,
            boardDefinition,
            type: 'Forms',
        });
    });
    await test.step(`Pin forms to board`, async () => {
        await navigationMenu.searchFormByName(formName1);
        await page.locator(`#pinToBoard_0`).click();
        await materialPage.pinToBoard(boardName);

        await navigationMenu.searchFormByName(formName2);
        await page.locator(`#pinToBoard_0`).click();
        await materialPage.pinToBoard(boardName);

        await navigationMenu.searchFormByName(formName3);
        await page.locator(`#pinToBoard_0`).click();
        await materialPage.pinToBoard(boardName);
    });

    await test.step(`Classify all forms in board`, async () => {
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();
        await myBoardPage.classifyAllFormsButton().click();
        await materialPage.classifyItemByOrgAndCategories(newOrg, classificationArray);
        await materialPage.checkAlert(`All Elements classified.`);
    });

    await test.step(`Verify all forms classified`, async () => {
        await page.locator(`#list_gridView`).click();
        await expect(page.getByText(`Steward`)).toBeVisible();
        await expect(page.getByText(`Registration Status`)).toBeVisible();

        await page.getByText(formName1).click();
        await expect(page.getByText(`Classify Board`)).toBeVisible();
        await page.goBack();

        await page.getByText(formName2).click();
        await expect(page.getByText(`Classify Board`)).toBeVisible();
        await page.goBack();

        await page.getByText(formName3).click();
        await expect(page.getByText(`Classify Board`)).toBeVisible();
        await page.goBack();
    });

    await test.step(`Unpin form`, async () => {
        await page.locator(`#list_summaryView`).click();
        await page.locator(`#unpin_1`).click();
        await materialPage.checkAlert(`Unpinned.`);
        await expect(page.getByText(formName2)).toBeHidden();
    });
});
