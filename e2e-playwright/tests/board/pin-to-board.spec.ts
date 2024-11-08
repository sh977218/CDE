import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { DUPLICATE_PINS, MULTIPLE_PINS } from '../../data/constants';

test.describe(`Pin to board`, async () => {
    test(`Not logged in`, async ({ navigationMenu, searchPage, cdePage, page }) => {
        const loggedOutMessage = [
            'Create Boards and save CDEs and Forms to them',
            'Remember your preferences on all your devices',
            "If approved, become a curator, and view/manage your organization's contents",
        ];
        await navigationMenu.gotoCdeSearch();
        await searchPage.browseOrganization('NINDS');
        await searchPage.pinAll().click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);

        await searchPage.pinBoardModalButton().click();

        await expect(page.getByTestId(`open-login-page`)).toBeVisible();
        await page.goBack();

        await searchPage.pinElement(0).click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);

        await searchPage.pinBoardModalClose().click();
        await searchPage.goToElt(0).click();
        await cdePage.addToBoard().click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);
        await searchPage.pinBoardModalClose().click();
    });

    test.describe(`Logged in`, async () => {
        test(`pin to board in form view`, async ({ page, navigationMenu, boardPage, myBoardPage }) => {
            const formName = 'Vessel Imaging Angiography';
            const boardName = 'AddFormBoard';
            await navigationMenu.login(Accounts.formBoardUser);
            await navigationMenu.gotoFormByName(formName);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await myBoardPage.selectBoardToPin(boardName);

            await navigationMenu.gotoMyBoard();
            await expect(page.locator('id=AddFormBoard')).toContainText('1 Form');
        });

        test('Create default board when pin CDE', async ({ page, materialPage, navigationMenu, myBoardPage }) => {
            await navigationMenu.login(Accounts.boarduser2);
            const cdeName1 = 'Prior BMSCT Administered Indicator';
            const cdeName2 = 'Biomarker Outcome Characteristics java.lang.String';
            const defaultBoardName = 'CDE Board 1';
            await navigationMenu.gotoCdeByName(cdeName1);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to New Board`);

            await navigationMenu.gotoCdeByName(cdeName2);
            await page.getByRole('button', { name: 'Pin to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${defaultBoardName}`);

            await navigationMenu.gotoMyBoard();
            await myBoardPage.boardTitle(defaultBoardName).click();
            await expect(page.getByText(cdeName1)).not.toHaveCount(0);
            await expect(page.getByText(cdeName2)).not.toHaveCount(0);

            await navigationMenu.gotoMyBoard();
            await page.locator("//*[@id='" + defaultBoardName + "']//*[contains(@class,'deleteBoard')]").click();
            await page.locator('id=saveDeleteBoardBtn').click();
            await materialPage.checkAlert('Deleted.');
            await expect(page.getByText(defaultBoardName)).toHaveCount(0);
        });

        test('Create default board when pin form', async ({ page, materialPage, navigationMenu, myBoardPage }) => {
            await navigationMenu.login(Accounts.boarduser2);
            const formName1 = 'ER/Admission Therapeutic Procedures';
            const formName2 = "Parkinson's Disease Quality of Life Scale (PDQUALIF)";
            const defaultBoardName = 'Form Board 1';
            await navigationMenu.gotoFormByName(formName1);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await materialPage.checkAlert(`Pinned to New Board`);

            await navigationMenu.gotoFormByName(formName2);
            await page.getByRole('button', { name: 'Add to Board' }).click();
            await materialPage.checkAlert(`Pinned to ${defaultBoardName}`);

            await navigationMenu.gotoMyBoard();
            await myBoardPage.boardTitle(defaultBoardName).click();
            await expect(page.getByText(formName1)).not.toHaveCount(0);
            await expect(page.getByText(formName2)).not.toHaveCount(0);

            await navigationMenu.gotoMyBoard();
            await page.locator("//*[@id='" + defaultBoardName + "']//*[contains(@class,'deleteBoard')]").click();
            await page.locator('id=saveDeleteBoardBtn').click();
            await materialPage.checkAlert('Deleted.');
            await expect(page.getByText(defaultBoardName)).toHaveCount(0);
        });

        test(`no double pin`, async ({ page, navigationMenu, searchPage, myBoardPage }) => {
            const cdeName = 'Specimen Inflammation Change Type';
            const boardName = 'Double Pin Board';
            await navigationMenu.login(Accounts.doublepinuser);
            await navigationMenu.gotoCdeSearch();
            await searchPage.pinCdeToBoardWithoutModal(cdeName, boardName);
            await searchPage.pinCdeToBoardWithoutModal(cdeName, boardName, DUPLICATE_PINS);

            await navigationMenu.gotoMyBoard();
            await myBoardPage.boardTitle(boardName).click();
            await expect(page.getByText(cdeName)).toHaveCount(1);
        });

        test(`pinAllLessThan20`, async ({ page, navigationMenu, searchPage, myBoardPage }) => {
            const boardName = 'Pin All Less Than 20 Test Board';
            await navigationMenu.login(Accounts.pinAllBoardUser);
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('NINDS');
            await searchPage.selectClassification(`Disease`);
            await searchPage.selectClassification(`Stroke`);
            await searchPage.selectClassification(`Classification`);
            await searchPage.selectClassification(`Exploratory`);
            const searchResultNumber = await searchPage.searchResultNumber().innerText();

            await searchPage.pinAllResultWithModal(boardName);
            await navigationMenu.gotoMyBoard();
            await expect(myBoardPage.boardBox(boardName).locator(`.numElement`)).toHaveText(searchResultNumber);
        });

        test(`pinAllMoreThan20`, async ({ page, navigationMenu, searchPage, myBoardPage }) => {
            const boardName = 'Pin All More Than 20 Test Board';
            await navigationMenu.login(Accounts.pinAllBoardUser);
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('NINDS');
            await searchPage.selectClassification(`Disease`);
            await searchPage.selectClassification(`Amyotrophic Lateral Sclerosis`);
            await searchPage.selectClassification(`Classification`);
            await searchPage.selectClassification(`Core`);
            const searchResultNumber = await searchPage.searchResultNumber().innerText();
            await searchPage.pinAllResultWithModal(boardName);
            await navigationMenu.gotoMyBoard();
            await expect(myBoardPage.boardBox(boardName).locator(`.numElement`)).toHaveText(searchResultNumber);
        });

        test(`pin all cde in form to board`, async ({ page, navigationMenu, searchPage, myBoardPage }) => {
            const formName = 'Imaging OCT Analysis -Cirrus Macular Thickness';
            const boardName = 'Pin All CDEs From Form';
            await navigationMenu.login(Accounts.pinAllBoardUser);
            await navigationMenu.gotoFormByName(formName);
            await searchPage.pinAllCdesWithModal(boardName);
            await navigationMenu.gotoMyBoard();
            await expect(myBoardPage.boardBox(boardName).locator(`.numElement`)).toHaveText('7');
        });
    });
});
