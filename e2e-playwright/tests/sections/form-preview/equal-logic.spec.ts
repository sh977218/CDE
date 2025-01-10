import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Equal logic`, async () => {
    test.describe(`Empty logic`, async () => {
        test(`create empty logic`, async ({ page, materialPage, navigationMenu, previewSection, formDescription }) => {
            const formName = 'Behavioral History';
            await test.step(`Navigate to Form and login`, async () => {
                await navigationMenu.gotoFormByName(formName, true);
                await navigationMenu.login(Accounts.nlm);
                await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
                await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
            });
            await test.step(`Add empty logic`, async () => {
                await previewSection.goToFormDescription();
                await formDescription.startEditQuestionById('question_0-17');
                await formDescription.addEmptyQuestionLogic([
                    'Date behavioral history taken',
                    'Current tobacco use?',
                    'Age started tobacco use',
                ]);
                await expect(formDescription.logic()).toHaveText(
                    `"Date behavioral history taken" = "" AND "Current tobacco use?" = "" AND "Age started tobacco use" = ""`
                );
            });
        });

        test(`empty logic render`, async ({ page, materialPage, navigationMenu, previewSection, formDescription }) => {
            const formName = 'Empty Logic';
            await test.step(`Navigate to Form and login`, async () => {
                await navigationMenu.gotoFormByName(formName);
                await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
                await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
            });
            await test.step(`verify print view`, async () => {
                await expect(previewSection.questionLabel().nth(0)).toContainText(`Birth date`);
                await expect(previewSection.questionLabel().nth(1)).toContainText(`If empty:`);

                await expect(previewSection.questionLabel().nth(2)).toContainText(
                    `Image Acquisition Event Yes No Not Done Indicator`
                );
                await expect(previewSection.questionLabel().nth(3)).toContainText(`If none:`);

                await expect(previewSection.questionLabel().nth(4)).toContainText(`Head injury prior number`);
                await expect(previewSection.questionLabel().nth(5)).toContainText(`If empty:`);

                await expect(previewSection.questionLabel().nth(6)).toContainText(`Noncompliant Reason Text`);
                await expect(previewSection.questionLabel().nth(7)).toContainText(`If empty:`);
            });

            await test.step(`toggle print view off`, async () => {
                await previewSection.togglePrintView();
            });

            await test.step(`verify non print view`, async () => {
                await test.step(`dates`, async () => {
                    const questionToBeFilled = 'Birth date';
                    const correctAnswer = '1995-01-01';
                    const answerWillBeShown = `Data unknown indicator`;
                    await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
                    await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
                    await expect(previewSection.questionLabel().nth(1)).not.toContainText(answerWillBeShown);
                });

                await test.step(`value lists`, async () => {
                    const questionToBeFilled = 'Image Acquisition Event Yes No Not Done Indicator';
                    const correctAnswer = 'No: C49487';
                    const answerWillBeShown = `Pulmonary function test not done reason`;
                    await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
                    await previewSection
                        .previewDiv()
                        .getByTitle(questionToBeFilled)
                        .getByRole('radio', { name: correctAnswer })
                        .click();
                    await expect(previewSection.questionLabel().nth(2)).not.toContainText(answerWillBeShown);
                });

                await test.step(`numbers`, async () => {
                    const questionToBeFilled = 'Head injury prior number';
                    const answerWillBeShown = `Pulmonary function test not done other text`;
                    const correctAnswer = '0';
                    await expect(previewSection.questionLabel().nth(3)).toContainText(answerWillBeShown);
                    await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
                    await expect(previewSection.questionLabel().nth(3)).not.toContainText(answerWillBeShown);
                });

                await test.step(`text`, async () => {
                    const questionToBeFilled = 'Noncompliant Reason Text';
                    const correctAnswer = 'abc';
                    const answerWillBeShown = `Perianal problem other text`;
                    await expect(previewSection.questionLabel().nth(4)).toContainText(answerWillBeShown);
                    await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
                    await expect(previewSection.questionLabel().nth(4)).toBeHidden();
                });
            });
        });
    });

    test.describe(`Non empty logic`, async () => {
        test(`Text`, async ({ page, navigationMenu, previewSection, formDescription }) => {
            const formName = 'Skip Logic Text Test Form';
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
                await formDescription.addQuestionLogic('AIS grade', '=', 'show question 4', 'text');
                await formDescription.backToPreviewButton().click();
            });

            await test.step(`toggle print view off`, async () => {
                await previewSection.togglePrintView();
            });

            await test.step(`verify non print view`, async () => {
                const questionToBeFilled = 'AIS grade';
                const answerWillBeShown = 'Noncompliant Reason Text';
                const incorrectAnswers = [`s`, `show question 5`];
                const correctAnswer = `show question 4`;
                for (let incorrectAnswer of incorrectAnswers) {
                    await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(incorrectAnswer);
                    await expect(previewSection.questionLabel().nth(2)).toBeHidden();
                }
                await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            });
        });

        test(`Value list`, async ({ page, navigationMenu, previewSection, formDescription }) => {
            const formName = 'Skip Logic Value List Test Form';
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
                await formDescription.addQuestionLogic('Adrenal Gland Received', '=', 'Fresh', 'value list');
                await formDescription.backToPreviewButton().click();
            });

            await test.step(`toggle print view off`, async () => {
                await previewSection.togglePrintView();
            });

            await test.step(`verify non print view`, async () => {
                const questionToBeFilled = 'Adrenal Gland Received';
                const answerWillBeShown = 'Noncompliant Reason Text';
                const incorrectAnswers = [`In formalin`, `Other (specify)`];
                const correctAnswer = `Fresh`;
                for (let incorrectAnswer of incorrectAnswers) {
                    await previewSection
                        .previewDiv()
                        .getByTitle(questionToBeFilled)
                        .getByRole('radio', { name: incorrectAnswer })
                        .click();
                    await expect(previewSection.questionLabel().nth(2)).toBeHidden();
                }
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .getByRole('radio', { name: correctAnswer })
                    .click();
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            });
        });
    });
});
