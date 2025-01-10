import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Unequal logic render`, async ({ page, navigationMenu, previewSection }) => {
    const formName = 'Not Equals Test';
    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`toggle print view off`, async () => {
        await previewSection.togglePrintView();
    });

    await test.step(`verify non print view`, async () => {
        await test.step(`number`, async () => {
            const questionToBeFilled = 'Spinal column injury number';
            const incorrectAnswer = '11';
            const correctAnswer = '111';
            const answerWillBeShown = 'Spinal surgery indicator';
            await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(incorrectAnswer);
            await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
            await expect(previewSection.questionLabel().nth(1)).not.toContainText(answerWillBeShown);
        });

        await test.step(`date`, async () => {
            const questionToBeFilled = 'Diagnosis date';
            const incorrectAnswer = '2016-01-02';
            const correctAnswer = '2015-01-01';
            const answerWillBeShown = 'Diagnosis age type';
            await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(incorrectAnswer);
            await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
            await expect(previewSection.questionLabel().nth(2)).not.toContainText(answerWillBeShown);
        });

        await test.step(`text`, async () => {
            const questionToBeFilled = 'Birth country name';
            const incorrectAnswer = 'Swe';
            const correctAnswer = 'Sweden';
            const answerWillBeShown = 'Birth Weight';
            await expect(previewSection.questionLabel().nth(3)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(incorrectAnswer);
            await expect(previewSection.questionLabel().nth(3)).toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
            await expect(previewSection.questionLabel().nth(3)).not.toContainText(answerWillBeShown);
        });
        await test.step(`value list`, async () => {
            const questionToBeFilled = 'Quality of Life - Write task list difficulty scale';
            const correctAnswer = 'None';
            const answerWillBeShown = 'Quality of Life - Stigma illness recent assessment scale';
            await expect(previewSection.questionLabel().nth(4)).toContainText(answerWillBeShown);
            await previewSection
                .previewDiv()
                .getByTitle(questionToBeFilled)
                .getByRole('radio', { name: correctAnswer })
                .click();
            await expect(previewSection.questionLabel().nth(4)).toBeHidden();
        });
    });
});
