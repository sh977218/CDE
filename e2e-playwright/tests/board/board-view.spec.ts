import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { move, randomGen } from '../../pages/util';

test.describe('GridView', async () => {
    test(`small board`, async ({ page, navigationMenu, searchPage, myBoardPage }) => {
        const boardName = 'Test Board';

        await navigationMenu.login(Accounts.boarduser);
        await navigationMenu.gotoCdeSearch();
        await searchPage.pinCdeToBoardWithModal(
            'Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage',
            boardName
        );
        await searchPage.pinCdeToBoardWithModal(
            'Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value',
            boardName
        );
        await searchPage.pinCdeToBoardWithModal(
            'Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count',
            boardName
        );
        await searchPage.pinCdeToBoardWithModal('Prior BMSCT Administered Indicator', boardName);
        await searchPage.pinCdeToBoardWithModal(
            'Generalized Activities of Daily Living Pain Restricted Scale',
            boardName
        );

        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();
        await page.getByRole('button', { name: 'Table View' }).click();
        await expect(page.getByText('Fluorescence in situ')).not.toHaveCount(0);
        await expect(page.getByText('Anaplastic Lymp')).not.toHaveCount(0);
        await expect(page.getByText('ALK Standard Deviation')).not.toHaveCount(0);
        await expect(page.getByText('Pathologic N Stage')).not.toHaveCount(0);
        await expect(page.getByText('pN0')).not.toHaveCount(0);
        await expect(page.getByText('3436564')).not.toHaveCount(0);
        await expect(page.getByText('3028594')).not.toHaveCount(0);
        await expect(page.getByText('Prior BMSCT Administered Indicator')).not.toHaveCount(0);
        await expect(page.getByText('Generalized Activities of Daily Living Pain')).not.toHaveCount(0);
        await expect(page.getByText('Platinum free')).not.toHaveCount(0);
        await expect(page.getByText('3535434')).not.toHaveCount(0);
    });

    test(`large board`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
        const boardName = 'Large Board';

        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();
        await page.getByRole('button', { name: 'Table View' }).click();
        await expect(page.getByText('VentilatorAssistanceUtilznInd')).not.toHaveCount(0);
        await expect(page.getByText('HMQMstFreqHlthProfCareTyp')).not.toHaveCount(0);
        await page.getByRole('button', { name: 'Summary View' }).click();
        await expect(
            page.getByText('Rome III Constipation Module (RCM3) - abdomen discomfort relieve bowel movement frequency')
        ).not.toHaveCount(0);
        await expect(page.getByText('VentilatorAssistanceUtilznInd')).toHaveCount(0);
        await expect(page.getByText('HMQMstFreqHlthProfCareTyp')).toHaveCount(0);
        await page.getByRole('button', { name: 'Table View' }).click();

        await materialPage.paginatorNext().click();
        await expect(page.getByText('Ventilator assistance utilization indicator')).toHaveCount(0);
        await expect(page.getByText('Surgery radiosurgery lobe location text')).not.toHaveCount(0);
        await expect(page.getByText('BRCDifficltFallAslpNghtInd')).not.toHaveCount(0);
        await expect(page.getByText('PulmFuncSNIPPeakPressrVal')).not.toHaveCount(0);
    });

    test(`can't view others' boards`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
        const boardName = 'Blood Board';

        await navigationMenu.login(Accounts.pinuser);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();

        await expect(page.getByText('Laboratory Procedure Blood Urea Nitrogen')).not.toHaveCount(0);
        await expect(page.getByText('Umbilical Cord Blood')).not.toHaveCount(0);

        const url = page.url();
        await navigationMenu.logout();
        await page.goto(url);
        await materialPage.checkAlert('Board Not Found');

        await navigationMenu.login(Accounts.orgAdminUser);
        await page.goto(url);
        await materialPage.checkAlert('Board Not Found');
    });

    test(`filter board`, async ({ page, materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.login(Accounts.tagBoardUser);
        await navigationMenu.gotoCdeSearch();
        await searchPage.browseOrganization('CITN');
        await page.locator('id=pinToBoard_0').click();
        await expect(materialPage.matDialog().getByText('X-Ray Board')).not.toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Leukemia Board')).not.toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Epilepsy Board')).not.toHaveCount(0);

        await materialPage.matDialog().locator("[data-id='tag-Disease']").click();
        await expect(materialPage.matDialog().getByText('X-Ray Board')).toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Leukemia Board')).not.toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Epilepsy Board')).not.toHaveCount(0);

        await materialPage.matDialog().locator("[data-id='tag-Disease']").click();
        await expect(materialPage.matDialog().getByText('X-Ray Board')).not.toHaveCount(0);
        await materialPage.matDialog().locator("[data-id='status-Private']").click();
        await expect(materialPage.matDialog().getByText('X-Ray Board')).not.toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Leukemia Board')).toHaveCount(0);
        await expect(materialPage.matDialog().getByText('Epilepsy Board')).toHaveCount(0);

        await expect(materialPage.matDialog().getByText('Device (1)')).not.toHaveCount(0);

        await materialPage.matDialog().waitFor();
        await materialPage.matDialog().getByRole('button', { name: 'Cancel' }).click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
    });

    test(`reorder pins`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
        const boardName = 'Test Pinning Board';

        await navigationMenu.login(Accounts.classifyBoardUser);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle(boardName).click();

        const cdeNameSelector = 'cde-summary-heading h2 a';
        await expect(page.locator(cdeNameSelector)).not.toHaveCount(0);

        const cdeNames = await page.locator(cdeNameSelector).allInnerTexts();

        await expect(page.locator(cdeNameSelector)).toHaveText(cdeNames);

        await test.step(`move cde down`, async () => {
            for (const index of randomGen(1, 18, 1)) {
                await myBoardPage.reorderPin(index, 'down');
                move(cdeNames, index, index + 1);
                await expect(page.locator(cdeNameSelector)).toHaveText(cdeNames);
            }
        });
        await test.step(`move cde up`, async () => {
            for (const index of randomGen(1, 19, 1)) {
                await myBoardPage.reorderPin(index, 'up');
                move(cdeNames, index, index - 1);
                await expect(page.locator(cdeNameSelector)).toHaveText(cdeNames);
            }
        });

        await test.step(`move cde top`, async () => {
            for (const index of randomGen(1, 19, 1)) {
                await myBoardPage.reorderPin(index, 'top');
                move(cdeNames, index, 0);
                await expect(page.locator(cdeNameSelector)).toHaveText(cdeNames);
            }
        });

        await test.step(`last pin move down goes to 2nd page`, async () => {
            const lastCdeNameOnPage1 = cdeNames[19];
            await myBoardPage.reorderPin(19, 'down');
            await materialPage.paginatorNext().click();
            await page.waitForTimeout(5000); // @TODO find a better way to know if the page update is completed
            await expect(page.locator(cdeNameSelector)).toHaveText(lastCdeNameOnPage1);
        });
    });
});
