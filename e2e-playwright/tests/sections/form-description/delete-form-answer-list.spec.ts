import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';
import { Accounts } from '../../../data/user';

test(`Form delete answer list`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
    const formName = `Answer List Test`;
    const answersToBeDeleted = [`American Indian or Alaska Native`, `Asian`];
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[delete form answer list]',
    };

    await test.step(`Navigate to Form description and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.testEditor);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await previewSection.editFormDescriptionButton().click();
    });

    await test.step(`Edit form question label and instruction`, async () => {
        await formDescription.startEditQuestionById('question_0-1');
        await formDescription.deleteAnswerListByIndex('question_0-1', answersToBeDeleted);
    });

    await test.step(`Save form`, async () => {
        await formDescription.saveFormEdit();
        await saveModal.newVersionByType('form', versionInfo);
    });

    await test.step(`Verify Form`, async () => {
        for (const answerToBeDeleted of answersToBeDeleted) {
            await expect(page.getByText(answerToBeDeleted)).toBeHidden();
        }
    });
});
