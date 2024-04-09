import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test.describe(`Merge form`, async () => {
    test.describe(`Own form`, async () => {
        test.beforeEach(async ({ navigationMenu }) => {
            await test.step(`Login and go to my board`, async () => {
                await navigationMenu.login(Accounts.nlm);
                await navigationMenu.gotoMyBoard();
            });
        });

        test(`Not aligned forms cannot be merged`, async ({ myBoardPage, boardPage }) => {
            await myBoardPage.boardTitle('NotAlignForm').click();
            await boardPage.compareButton().click();
            await boardPage.openMergeFormModalButton().click();
            await expect(boardPage.mergeFormError()).toHaveText(`Form not align`);
            await boardPage.closeMergeFormButton().click();
        });

        test(`Left form has more questions cannot be merged`, async ({ myBoardPage, boardPage }) => {
            await myBoardPage.boardTitle('SourceFormMoreQuestions').click();
            await boardPage.compareButton().click();
            await boardPage.openMergeFormModalButton('right').click();
            await expect(boardPage.mergeFormError()).toHaveText(`Left form has too many questions`);
            await boardPage.closeMergeFormButton().click();
        });

        test(`Merge and retire CDEs`, async ({
            page,
            materialPage,
            navigationMenu,
            searchPreferencesPage,
            myBoardPage,
            boardPage,
            searchPage,
            cdePage,
            formPage,
            generateDetailsSection,
        }) => {
            const nlmForm = `PHQ-9 quick depression assessment panel [Reported.PHQ]`;
            const nindsForm = `Patient Health Questionnaire - 9 (PHQ-9) Depression Scale`;
            await test.step(`Go to 'MergeFormRetire'`, async () => {
                await myBoardPage.boardTitle('MergeFormRetire').click();
                await boardPage.compareButton().click();
            });
            await test.step(`merge nindsForm into nlmForm`, async () => {
                await boardPage.openMergeFormModalButton().click();
                await boardPage.retireCdeCheckbox().check();
                await boardPage.mergeFormButton().click();
                await materialPage.checkAlert('Form merged');
                for (const l of await boardPage.leftQuestions().all()) {
                    await expect(l).toContainText('Retired');
                }
                await boardPage.closeMergeFormButton().click();
                await boardPage.closeCompareModalButton().click();
            });

            await test.step(`Search preference include 'Retired'`, async () => {
                await navigationMenu.searchPreferencesButton().click();
                await searchPreferencesPage.searchPreferencesCheckbox().check();
                await searchPreferencesPage.saveButton().click();
                await materialPage.checkAlert('Settings saved!');
            });

            await test.step(`Search nindsForm return 2 results`, async () => {
                await navigationMenu.gotoFormSearch();
                await searchPage.searchQueryInput().fill(`"${nindsForm}"`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.searchResultInfoBar()).toHaveText('2 results. Sorted by relevance.');
            });

            await test.step(`Search nlmForm return 1 results`, async () => {
                await navigationMenu.gotoFormSearch();
                await searchPage.searchQueryInput().fill(`"${nlmForm}"`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.searchResultInfoBar()).toHaveText('1 results. Sorted by relevance.');
            });

            await test.step(`Verify nindsForm (Retired)`, async () => {
                await navigationMenu.gotoFormByName(nindsForm);
                await expect(page.getByText('Merge to tinyId mJsGoMU1m')).toBeVisible();
                await expect(formPage.alerts()).toContainText(
                    `This form version is no longer current. The most current version of this form is available here:`
                );
                await test.step(`Go to current version`, async () => {
                    await formPage.mergeToLink().click();
                    await expect(formPage.formTitle()).toContainText(nlmForm);
                    await expect(generateDetailsSection.copyrightCheckbox()).toBeChecked();
                    await expect(generateDetailsSection.copyrightStatement()).toContainText('Proprietary');
                });
            });

            const nindsCde = `Patient Health Questionnaire Depression (PHQ-9) - Sleep impairment score`;
            const nlmCde = `Trouble falling or staying asleep, or sleeping too much in last 2 weeks [Reported.PHQ]`;
            await test.step(`Search nindsCde return 2 results`, async () => {
                await navigationMenu.gotoCdeSearch();
                await searchPage.searchQueryInput().fill(`"${nindsCde}"`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.searchResultInfoBar()).toHaveText('2 results. Sorted by relevance.');
            });

            await test.step(`Search nlmCde return 1 results`, async () => {
                await navigationMenu.gotoFormSearch();
                await searchPage.searchQueryInput().fill(`"${nlmCde}"`);
                await searchPage.searchSubmitButton().click();
                await expect(searchPage.searchResultInfoBar()).toHaveText('1 results. Sorted by relevance.');
            });

            await test.step(`Verify nindsCde (Retired)`, async () => {
                await navigationMenu.gotoCdeByName(nindsCde);
                await expect(cdePage.alerts()).toContainText(`This data element is retired.`);
                await test.step(`Go to current version`, async () => {
                    await cdePage.mergeToLink().click();
                    await expect(cdePage.cdeTitle()).toContainText(nlmCde);
                });
            });
        });
    });

    test(`Not own form`, async ({ navigationMenu, myBoardPage, boardPage }) => {
        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle('NoMergeTest').click();
        await boardPage.compareButton().click();
        await expect(boardPage.openMergeFormModalButton()).not.toBeVisible();
    });
});
