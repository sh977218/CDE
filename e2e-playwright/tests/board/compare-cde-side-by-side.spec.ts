import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Board compare CDE side by side`, async ({ page, materialPage, navigationMenu, myBoardPage, boardPage }) => {
    const boardName = `CDE Compare Board`;
    const boardDefinition = `Test Compare`;

    const cdeName1 = `cdeCompare1`;
    const cdeName2 = `cdeCompare2`;

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.testEditor);
    });
    await test.step(`Creat board`, async () => {
        await navigationMenu.gotoMyBoard();
        await myBoardPage.createBoard({
            boardName,
            boardDefinition,
            type: 'CDEs',
        });
    });

    await test.step(`Pin CDEs to board`, async () => {
        await navigationMenu.searchCdeByName(cdeName1);
        await page.locator(`#pinToBoard_0`).click();
        await materialPage.pinToBoard(boardName);

        await navigationMenu.searchCdeByName(cdeName2);
        await page.locator(`#pinToBoard_0`).click();
        await materialPage.pinToBoard(boardName);
    });

    await test.step(`Go to board and compare`, async () => {
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();
        await boardPage.eltSelectCheckbox().first().check();
        await boardPage.eltSelectCheckbox().nth(1).check();
        await boardPage.compareButton().click();
    });

    await test.step(`Verify compare result`, async () => {
        await materialPage.matDialog().waitFor();
        await expect(
            boardPage.compareLeftContainer().filter({
                has: boardPage.fullMatchContainer(),
            })
        ).toHaveText([`TEST`, `Incomplete`, `Definition:this is for testingTags:["Health"]`, `Text`]);
        await expect(
            boardPage.compareRightContainer().filter({
                has: boardPage.fullMatchContainer(),
            })
        ).toHaveText([`TEST`, `Incomplete`, `Definition:this is for testingTags:["Health"]`, `Text`]);

        await expect(
            boardPage.compareLeftContainer().filter({
                has: boardPage.notMatchContainer(),
            })
        ).toHaveText([
            `Designation:cdeCompare1Tags:["Health"]`,
            `Title:reference document title 1URI:reference document uri 1Document:reference document 1Document Type:Provider Org:reference document provider org 1Language Code:reference document language code 1`,
            `Key:key 1Value:value 1Source:Value Format:`,
            `Name:concept name 1Origin:LOINCOrigin Id:concept code id 1`,
        ]);
        await boardPage.closeCompareModalButton().click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
    });
});
