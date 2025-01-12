import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Skip logic`, async () => {
    test(`No label`, async ({ page, navigationMenu, previewSection, formDescription }) => {
        const formName = 'Skip Logic No Label Form';
        const questionId = 'question_0-5';
        const questionLabels = [
            'Ethnic Group Category Text',
            'Noncompliant Reason Text',
            'Person Birth Date',
            'Gender type',
            'Walking speed value',
        ];
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`add skip logic with question no label`, async () => {
            await previewSection.goToFormDescription();
            await formDescription.startEditQuestionById(questionId);
            await formDescription.addEmptyQuestionLogic(questionLabels);
        });
    });

    test(`Update skip logic label when question label updated`, async ({
        page,
        navigationMenu,
        previewSection,
        formDescription,
    }) => {
        const formName = 'Study Discontinuation/Completion';
        const questionId = 'question_0-0';
        const questionLabels = [
            'Ethnic Group Category Text',
            'Noncompliant Reason Text',
            'Person Birth Date',
            'Gender type',
            'Walking speed value',
        ];
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            const questionToBeFilled1 = 'Off study date';
            const questionToBeFilled2 = 'Did participant subject discontinue intervention before planned end of study?';
            const correctAnswer1 = `2016-10-15`;
            const correctAnswer2 = `No`;
            const answerWillBeShown = 'Reason for premature intervention discontinuation';
            await expect(previewSection.questionLabel().nth(4)).not.toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled1).fill(correctAnswer1);
            await previewSection
                .previewDiv()
                .getByTitle(questionToBeFilled2)
                .getByRole('radio', {
                    name: correctAnswer2,
                    exact: true,
                })
                .click();
            await expect(previewSection.questionLabel().nth(4)).toContainText(answerWillBeShown);
        });

        await test.step(`edit question label`, async () => {
            await previewSection.goToFormDescription();
            await formDescription.startEditQuestionById(questionId);
            await formDescription.selectQuestionLabelByIndex(questionId, 0, true);
        });

        await test.step(`back to preview, toggle print view off`, async () => {
            await formDescription.backToPreviewButton().click();
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            const questionToBeFilled1 = 'Off study date';
            const questionToBeFilled2 = 'Did participant subject discontinue intervention before planned end of study?';
            const correctAnswer1 = `2016-10-15`;
            const correctAnswer2 = `No`;
            const answerWillBeShown = 'Reason for premature intervention discontinuation';
            await expect(previewSection.questionLabel().nth(4)).not.toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle(questionToBeFilled1).fill(correctAnswer1);
            await previewSection
                .previewDiv()
                .getByTitle(questionToBeFilled2)
                .getByRole('radio', {
                    name: correctAnswer2,
                    exact: true,
                })
                .click();
            await expect(previewSection.questionLabel().nth(4)).toContainText(answerWillBeShown);
        });
    });

    test(`Repeat question`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Question Repeat';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            await test.step(`text`, async () => {
                const questionToBeFilled = 'Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number';
                const correctAnswer = `1`;
                const answerWillBeShown = 'DCE-MRI Kinetics T1 Mapping Quality Type';
                await expect(previewSection.questionLabel().nth(2)).not.toContainText(answerWillBeShown);
                await previewSection.previewDiv().getByTitle(questionToBeFilled).first().fill(correctAnswer);
                await previewSection.previewDiv().getByTitle(questionToBeFilled).nth(1).fill(correctAnswer);
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown);
            });
            await test.step(`Value list`, async () => {
                const questionToBeFilled = 'Neoadjuvant Therapy';
                const correctAnswer = `Yes`;
                const answerWillBeShown = 'Tumor T1 Signal Intensity Category';
                await expect(previewSection.questionLabel().nth(4)).not.toContainText(answerWillBeShown);
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .first()
                    .getByRole('radio', {
                        name: correctAnswer,
                    })
                    .click();
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .nth(1)
                    .getByRole('radio', {
                        name: correctAnswer,
                    })
                    .click();
                await expect(previewSection.questionLabel().nth(5)).toContainText(answerWillBeShown);
            });
        });
    });

    test(`Multiple sub question`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Multi SubQuestion';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            await test.step(`Value list`, async () => {
                const questionToBeFilled = 'Was genetic testing performed?';
                const correctAnswer = `Yes`;
                const answerWillBeShown1 = 'What year was the genetic testing performed?';
                const answerWillBeShown2 = 'Test Name';
                await expect(previewSection.questionLabel().nth(1)).toBeHidden();
                await expect(previewSection.questionLabel().nth(2)).toBeHidden();
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .first()
                    .getByRole('radio', {
                        name: correctAnswer,
                    })
                    .click();
                await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown1);
                await expect(previewSection.questionLabel().nth(2)).toContainText(answerWillBeShown2);
            });

            await test.step(`Multiple select`, async () => {
                const questionToBeFilled = 'Test Name';
                const correctAnswer = `Frataxin Level`;
                const answerWillBeShown = 'Fasting Information';
                await previewSection.previewDiv().getByTitle(questionToBeFilled).first().selectOption(correctAnswer);
                await expect(previewSection.previewDiv()).toContainText(answerWillBeShown);
            });
        });
    });
    test(`Single permissible value`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Cancer Screening Test';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`toggle print view off`, async () => {
            await previewSection.togglePrintView();
        });

        await test.step(`verify non print view`, async () => {
            await test.step(`text`, async () => {
                const questionToBeFilled = 'Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score';
                const correctAnswer = `200`;
                const answerWillBeShown = 'Patient Gender Category';
                await expect(previewSection.questionLabel().nth(1)).toBeHidden();
                await previewSection.previewDiv().getByTitle(questionToBeFilled).fill(correctAnswer);
                await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
            });

            await test.step(`Value list`, async () => {
                const questionToBeFilled = 'Patient Gender Category';
                const correctAnswer = `Female Gender`;
                const answerWillBeShown = 'Female Patient Screening';
                await previewSection
                    .previewDiv()
                    .getByTitle(questionToBeFilled)
                    .first()
                    .getByRole('radio', { name: correctAnswer })
                    .click();
                await expect(previewSection.previewDiv()).toContainText(answerWillBeShown);
            });
        });
    });
});
