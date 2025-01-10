import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Less logic render`, async () => {
    test(`Number`, async ({ page, navigationMenu, previewSection, formDescription }) => {
        const formName = 'Skip Logic Number Test Form';
        const questionLabel = 'Noncompliant Reason Text';

        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`add skip logic`, async () => {
            await previewSection.goToFormDescription();
            await formDescription.startEditQuestionByLabel(questionLabel);
            await formDescription.addQuestionLogic('Additional Dimension', '<', '3', 'number');
            await formDescription.backToPreviewButton().click();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            const questionToBeFilled = 'Additional Dimension';
            const answerWillBeShown = 'Noncompliant Reason Text';
            const withRangeAnswers = new Array(3).fill(0).map((_, i) => i + ''); // PW's fill() api only take string
            const incorrectAnswers = [3, 4].map((v, i) => v + ''); // PW's fill() api only take string
            for (let withRangeAnswer of withRangeAnswers) {
                await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(withRangeAnswer);
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            }
            for (let incorrectAnswer of incorrectAnswers) {
                await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(incorrectAnswer);
                await expect(previewSection.questionLabel().nth(2)).toBeHidden();
            }
        });
    });

    test(`Date`, async ({ page, navigationMenu, previewSection, formDescription }) => {
        const formName = 'Skip Logic Date Test Form';
        const questionLabel = 'Noncompliant Reason Text';

        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`add skip logic`, async () => {
            await previewSection.goToFormDescription();
            await formDescription.startEditQuestionByLabel(questionLabel);
            await formDescription.addQuestionLogic('Axillary Surgery Dissection Date', '<', '2019-02-05', 'date');
            await formDescription.backToPreviewButton().click();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            const questionToBeFilled = 'Axillary Surgery Dissection Date';
            const answerWillBeShown = 'Noncompliant Reason Text';
            const withRangeAnswers = [`2019-02-03`, `2019-02-04`];
            const incorrectAnswers = [`2019-02-05`, `2019-02-06`];
            for (let withRangeAnswer of withRangeAnswers) {
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .fill(withRangeAnswer + '');
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            }
            for (let incorrectAnswer of incorrectAnswers) {
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .fill(incorrectAnswer + '');
                await expect(previewSection.questionLabel().nth(2)).toBeHidden();
            }
        });
    });
});
