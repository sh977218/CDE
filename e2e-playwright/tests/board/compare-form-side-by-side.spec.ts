import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe(`Board compare Form side by side`, async () => {
    test(`not aligned cannot compare`, async ({ page, materialPage, navigationMenu, myBoardPage, boardPage }) => {
        const formName1 = 'Family History - SMA';
        const formName2 = 'Anatomical Functional Imaging';
        const formName3 = 'Tinnitus Functional Index (TFI)';
        const boardName = 'Form Compare Board';
        const boardDefinition = 'Test Compare';

        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.boarduser1);
        });
        await test.step(`Creat board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.createBoardSuccess({
                boardName,
                boardDefinition,
                type: 'Forms',
            });
        });

        await test.step(`Add forms`, async () => {
            await navigationMenu.gotoFormByName(formName1);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);

            await navigationMenu.gotoFormByName(formName2);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);

            await navigationMenu.gotoFormByName(formName3);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${boardName}`);
        });

        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();

        await test.step(`select one form and compare`, async () => {
            await boardPage.eltSelectCheckbox().first().check();
            await boardPage.compareButton().click();
            await materialPage.checkAlert('Please select only two elements to compare.');
        });

        await test.step(`select two more forms and compare`, async () => {
            await boardPage.eltSelectCheckbox().nth(1).check();
            await boardPage.eltSelectCheckbox().nth(2).check();
            await boardPage.compareButton().click();
            await materialPage.checkAlert('Please select only two elements to compare.');
        });

        await test.step(`delete board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.deleteBoardByName(boardName);
        });
    });

    test(`compare form detail`, async ({ page, materialPage, navigationMenu, boardPage, myBoardPage }) => {
        const formName1 = 'compareForm1';
        const formName2 = 'compareForm2';
        const formName3 = 'compareForm3';
        const formName4 = 'compareForm4';
        const formName5 = 'emptyForm';
        const formName6TinyId = '7JUBzySHFg';
        const formName7TinyId = 'my7rGyrBYx';

        const boardName = 'Form Compare Board';
        const boardDefinition = 'Test Compare';

        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.testEditor);
        });

        await test.step(`Creat board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.createBoardSuccess({
                boardName,
                boardDefinition,
                type: 'Forms',
            });
        });

        await test.step(`Add forms`, async () => {
            for (const formName of [formName1, formName2, formName3, formName4, formName5]) {
                await navigationMenu.gotoFormByName(formName);
                await page.getByRole('button', { name: 'Add to Board' }).click();
                await materialPage.checkAlert(`Pinned to ${boardName}`);
            }
            for (const formTinyId of [formName6TinyId, formName7TinyId]) {
                await navigationMenu.gotoFormByTinyId(formTinyId);
                await page.getByRole('button', { name: 'Add to Board' }).click();
                await materialPage.checkAlert(`Pinned to ${boardName}`);
            }
        });

        await test.step(`compare form1 and form2`, async () => {
            await test.step(`Go to form`, async () => {
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle(boardName).click();
            });

            await boardPage.eltSelectCheckbox().first().check();
            await boardPage.eltSelectCheckbox().nth(1).check();
            await boardPage.compareButton().click();

            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'fullmatch', 1))).toContainText(
                'DCE-MRI Kinetics T1 Mapping Quality Type'
            );
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'fullmatch', 1))
            ).toContainText('DCE-MRI Kinetics T1 Mapping Quality Type');
            await expect(
                page.locator(boardPage.getSideBySideXpath('left', 'questions', 'partialmatch', 1))
            ).toContainText('Tumor Characteristics: T1 Sig');
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'partialmatch', 1))
            ).toContainText('Tumor T1 Signal Intensity Category');
            await expect(
                page.locator(boardPage.getSideBySideXpath('left', 'questions', 'partialmatch', 2))
            ).toContainText('Pain location anatomic site');
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'partialmatch', 2))
            ).toContainText('Pain location anatomic site');
            await page.locator('id=closeCompareSideBySideBtn').click();
        });

        await test.step(`compare form3 and form4`, async () => {
            await test.step(`Go to form`, async () => {
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle(boardName).click();
            });
            await boardPage.eltSelectCheckbox().nth(2).check();

            await boardPage.eltSelectCheckbox().nth(3).check();
            await boardPage.compareButton().click();

            await expect(
                page.locator(boardPage.getSideBySideXpath('left', 'identifiers', 'partialMatch', 1))
            ).toContainText('Id:987654321');
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'identifiers', 'partialMatch', 1))
            ).toContainText('Id:123456789');
            await expect(
                page.locator(boardPage.getSideBySideXpath('left', 'Related Documents', 'partialMatch', 1))
            ).toContainText('Document Type:www.google.com');
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'Related Documents', 'partialMatch', 1))
            ).toContainText('Document Type:www.reddit.com');

            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'notmatch', 1))).toContainText(
                'Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage'
            );

            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'notmatch', 2))).toContainText(
                'Ethnic Group Category Text'
            );
            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'fullmatch', 1))).toContainText(
                'Adverse Event Ongoing Event Indicator'
            );
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'fullmatch', 1))
            ).toContainText('Adverse Event Ongoing Event Indicator');
            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'fullmatch', 2))).toContainText(
                'Noncompliant Reason Text'
            );
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'fullmatch', 2))
            ).toContainText('Noncompliant Reason Text');
            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'fullmatch', 3))).toContainText(
                'Race Category Text'
            );
            await expect(
                page.locator(boardPage.getSideBySideXpath('right', 'questions', 'fullmatch', 3))
            ).toContainText('Race Category Text');
            await page.locator('id=closeCompareSideBySideBtn').click();
        });

        await test.step(`compare form1 and form5`, async () => {
            await test.step(`Go to form`, async () => {
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle(boardName).click();
            });

            await boardPage.eltSelectCheckbox().nth(0).check();

            await boardPage.eltSelectCheckbox().nth(4).check();
            await boardPage.compareButton().click();

            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'notmatch', 1))).toContainText(
                'Tumor Characteristics: T1 Sig'
            );
            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'notmatch', 2))).toContainText(
                'Pain location anatomic site'
            );
            await expect(page.locator(boardPage.getSideBySideXpath('left', 'questions', 'notmatch', 3))).toContainText(
                'DCE-MRI Kinetics T1 Mapping Quality Type'
            );
            await page.locator('id=closeCompareSideBySideBtn').click();
        });

        await test.step(`compare form6 and form7`, async () => {
            await test.step(`Go to form`, async () => {
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle(boardName).click();
            });

            await boardPage.eltSelectCheckbox().nth(5).check();
            await boardPage.eltSelectCheckbox().nth(6).check();
            await boardPage.compareButton().click();
            await expect(page.getByText('F0919')).not.toHaveCount(0);
            await expect(page.getByText('F0954')).not.toHaveCount(0);
            await page.locator('id=closeCompareSideBySideBtn').click();
        });

        await test.step(`delete board`, async () => {
            await navigationMenu.gotoMyBoard();
            await myBoardPage.deleteBoardByName(boardName);
        });
    });
});
