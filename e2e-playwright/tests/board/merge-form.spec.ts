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
            await boardPage.openMergeFormModalButton().click();
            await expect(boardPage.mergeFormError()).toHaveText(`Left form has too many questions`);
            await boardPage.closeMergeFormButton().click();
        });

        test(`Merge and retire CDEs`, async ({
            materialPage,
            navigationMenu,
            searchPreferencesPage,
            myBoardPage,
            boardPage,
            cdePage,
            formPage,
        }) => {
            await test.step(`Go to 'MergeFormRetire' and merge form`, async () => {
                await myBoardPage.boardTitle('MergeFormRetire').click();
                await boardPage.compareButton().click();
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

            await test.step(`Search with merged and retired Form`, async () => {
                await navigationMenu.searchPreferencesButton().click();
                await searchPreferencesPage.searchPreferencesCheckbox().check();
                await searchPreferencesPage.saveButton().click();
                const formName = `PHQ-9 quick depression assessment panel [Reported.PHQ]`;
                await navigationMenu.gotoFormByName(formName);
            });

            await test.step(`Verify retired Form`, async () => {
                await expect(formPage.alerts()).toContainText(
                    `This form version is no longer current. The most current version of this form is available here:`
                );
                await formPage.mergeToLink().click();
                await test
                    .expect(formPage.formTitle())
                    .toContainText('Patient Health Questionnaire - 9 (PHQ-9) Depression Scale');
            });

            await test.step(`Verify retired CDE`, async () => {
                const cdeName = `Trouble falling or staying asleep, or sleeping too much in last 2 weeks [Reported.PHQ]`;
                await navigationMenu.gotoCdeByName(cdeName);
                await expect(cdePage.alerts()).toContainText(`This data element is retired.`);
                await cdePage.mergeToLink().click();
                await expect(cdePage.cdeTitle()).toContainText('Sleep impairment score');
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
