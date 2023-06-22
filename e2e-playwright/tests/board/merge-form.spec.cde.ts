import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import cdeTinyId from '../../data/cde-tinyId';
import formTinyId from '../../data/form-tinyId';
import { expect } from '@playwright/test';

test.describe(`Merge form`, async () => {
    test.describe(`Own form`, async () => {
        test.beforeEach(async ({basePage, navigationMenu}) => {
            await basePage.goToHome();
            await navigationMenu.login(user.nlm.username, user.nlm.password);
            await navigationMenu.gotoMyBoard();
        })

        test(`Not aligned forms cannot be merged`, async ({myBoardPage, boardPage}) => {
            await myBoardPage.boardTitle('NotAlignForm').click();
            await boardPage.compareButton().click();
            await boardPage.openMergeFormModalButton().click();
            await test.expect(boardPage.mergeFormError()).toHaveText(`Form not align`);
            await boardPage.closeMergeFormButton().click();
        })

        test(`Left form has more questions cannot be merged`, async ({myBoardPage, boardPage}) => {
            await myBoardPage.boardTitle('SourceFormMoreQuestions').click();
            await boardPage.compareButton().click();
            await boardPage.openMergeFormModalButton().click();
            await test.expect(boardPage.mergeFormError()).toHaveText(`Left form has too many questions`);
            await boardPage.closeMergeFormButton().click();
        })

        test(`Merge and retire CDEs`, async ({myBoardPage, boardPage, cdePage, formPage, snackBar}) => {
            await myBoardPage.boardTitle('MergeFormRetire').click();
            await boardPage.compareButton().click();
            await boardPage.openMergeFormModalButton().click();
            await boardPage.retireCdeCheckbox().check();
            await boardPage.mergeFormButton().click();
            await snackBar.checkAlert('Form merged');
            for (const l of await boardPage.leftQuestions().all()) {
                await test.expect(await l.innerText()).toContain('Retired');
            }
            const formName = `PHQ-9 quick depression assessment panel [Reported.PHQ]`;
            await formPage.goToForm(formTinyId[formName]);
            await test.expect(await formPage.alerts().innerText()).toContain(`This form is retired.`);
            await formPage.mergeToLink().click();
            await test.expect(formPage.formTitle()).toContainText('Patient Health Questionnaire - 9 (PHQ-9) Depression Scale');
            const cdeName = `Trouble falling or staying asleep, or sleeping too much in last 2 weeks [Reported.PHQ]`;
            await cdePage.goToCde(cdeTinyId[cdeName]);
            await test.expect(await cdePage.alerts().innerText()).toContain(`This data element is retired.`);
            await cdePage.mergeToLink().click();
            await test.expect(cdePage.cdeTitle()).toContainText('Sleep impairment score');

        })
    })

    test(`Not own form`, async ({basePage, navigationMenu, myBoardPage, boardPage}) => {
        await basePage.goToHome();
        await navigationMenu.login(user.ninds.username, user.ninds.password);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle('NoMergeTest').click();
        await boardPage.compareButton().click();
        await test.expect(boardPage.openMergeFormModalButton()).not.toBeVisible();
    })

});
