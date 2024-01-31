import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Board classify all CDEs`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
    const boardName = `Classify Board`;
    const newOrg = `TEST`;
    const classificationArray = [`Classify Board`];
    await navigationMenu.login(Accounts.classifyBoardUser);
    await navigationMenu.gotoMyBoard();
    await myBoardPage.boardTitle(boardName).click();
    await myBoardPage.classifyAllCDEsButton().click();

    await materialPage.classifyItemByOrgAndCategories(newOrg, classificationArray);
    await materialPage.checkAlert(`All Elements classified.`);

    await page.getByText(`Manual muscle testing date and time`).click();
    await expect(page.getByText(`Classify Board`)).toBeVisible();
});
