import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Empty answer list render`, async ({ page, navigationMenu, previewSection, formDescription }) => {
    const formName = 'Stroke Symptoms/Comorbid Events';
    const questionId = 'question_0-0';
    const questionName = 'Stroke symptom/comorbid event';
    const answerName = 'Sudden numbness or weakness of the face, arm or leg, especially on one side of the body';

    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
    });

    await test.step(`Verify answer list `, async () => {
        await expect(previewSection.previewDiv().getByTitle(questionName).first()).toContainText(answerName);
    });

    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
    });

    await test.step(`Delete answer list`, async () => {
        await formDescription.startEditQuestionById(questionId);
        await formDescription.deleteAllAnswerListByIndex();
    });

    await test.step(`Go back to preview`, async () => {
        await formDescription.backToPreviewButton().click();
    });

    await test.step(`Verify answer list`, async () => {
        await expect(previewSection.previewDiv().getByTitle(questionName).first()).not.toContainText(answerName);
    });
});
