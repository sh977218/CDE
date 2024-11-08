import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';
import { Board } from '../../model/type';

test.describe.configure({ retries: 0 });
test.describe(`Board compare CDE side by side`, async () => {
    test(`compare CDE in detail`, async ({ page, materialPage, navigationMenu, myBoardPage, boardPage }) => {
        test.fixme();
        const boardName = `CDE Compare Board`;
        const boardDefinition = `Test Compare`;

        const cdeName1 = `cdeCompare1`;
        const cdeName2 = `cdeCompare2`;

        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.testEditor);
        });
        await test.step(`Creat board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.createBoardSuccess({
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

    test(`CdeMergeMineTheir`, async ({ page, materialPage, navigationMenu, myBoardPage, boardPage }) => {
        const cdeName1 = 'Smoking Cessation Other Method Specify Text';
        const cdeName2 = 'Smoking History Ind';
        const board: Board = {
            boardName: 'MergeMineTheir',
            boardDefinition: 'Test No Merge',
            type: 'CDEs',
        };
        const { boardName } = board;

        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.cabigEditor);
        });

        await test.step(`Creat board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.createBoardSuccess(board);
        });
        await test.step(`Add Cdes`, async () => {
            await navigationMenu.gotoCdeByName(cdeName1);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);

            await navigationMenu.gotoCdeByName(cdeName2);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);
        });
        await test.step(`Go to board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.boardTitle(boardName).click();
        });

        await test.step(`select two more CDEs and compare`, async () => {
            await boardPage.eltSelectCheckbox().nth(0).check();
            await boardPage.eltSelectCheckbox().nth(1).check();
            await boardPage.compareButton().click();
        });

        await test.step(`verify merge button is not visible`, async () => {
            await materialPage.matDialog().waitFor();
            await expect(
                materialPage.matDialog().getByRole('button', { name: 'merge into This Data Element' })
            ).toBeHidden();
            await materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
            await materialPage.matDialog().waitFor({ state: 'hidden' });
        });

        await test.step(`delete board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.deleteBoardByName(boardName);
        });
    });

    test(`cdeMergeMineMine`, async ({ page, materialPage, navigationMenu, myBoardPage, boardPage }) => {
        const cdeName1 = 'Common Toxicity Criteria Adverse Event Colitis Grade';
        const cdeName2 = 'Common Toxicity Criteria Adverse Event Hypophosphatemia Grade';
        const board: Board = {
            boardName: 'MergeMineMine',
            boardDefinition: 'Merge Test',
            type: 'CDEs',
        };
        const { boardName } = board;

        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.ctepEditor);
        });

        await test.step(`Creat board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.createBoardSuccess(board);
        });

        await test.step(`Add Cdes`, async () => {
            await navigationMenu.gotoCdeByName(cdeName1);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);

            await navigationMenu.gotoCdeByName(cdeName2);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);
        });

        await test.step(`Go to board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.boardTitle(boardName).click();
        });

        await test.step(`select two more CDEs and compare`, async () => {
            await boardPage.eltSelectCheckbox().nth(0).check();
            await boardPage.eltSelectCheckbox().nth(1).check();
            await boardPage.compareButton().click();
        });

        await test.step(`verify merge button is not visible`, async () => {
            await materialPage.matDialog().waitFor();
            await materialPage
                .matDialog()
                .locator('.rightObj')
                .getByRole('button', { name: 'merge into This Data Element' })
                .click();
            await page.getByRole('button', { name: 'Select All', exact: true }).click();
            await page.locator('id=doMergeBtn').click();
            await materialPage.checkAlert('Finished merging');
            await expect(
                materialPage.matDialog().locator(`//*[@id='Status']//*[contains(@class,'noLeftPadding')]`)
            ).toContainText('Retired');
            await materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
            await materialPage.matDialog().waitFor({ state: 'hidden' });
        });

        await test.step(`delete board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.deleteBoardByName(boardName);
        });

        await navigationMenu.gotoCdeByName(cdeName2);
        await expect(page.getByText(cdeName1)).not.toHaveCount(0);
        await expect(page.getByText('CTC Adverse Event Colitis Gra')).not.toHaveCount(0);
        await expect(page.getByText('Colitis Grade')).not.toHaveCount(0);
        await expect(page.getByText('2005490')).not.toHaveCount(0);
        await expect(page.getByText('MyKey2')).not.toHaveCount(0);
        await expect(page.getByText('Colitis ref doc')).not.toHaveCount(0);
        await expect(page.getByText('TEST')).not.toHaveCount(0);
        await expect(page.getByText('NLM CDE Dev Team Test')).not.toHaveCount(0);
        await expect(page.getByText('All Candidates')).not.toHaveCount(0);
        await expect(page.getByText('caBIG')).not.toHaveCount(0);
        await expect(page.getByText('')).not.toHaveCount(0);
    });
});
