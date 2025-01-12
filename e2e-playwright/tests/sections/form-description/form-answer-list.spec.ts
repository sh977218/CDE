import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';
import { Accounts } from '../../../data/user';

test.describe(`Form answer list`, async () => {
    test(`verify answer list when add cde`, async ({
        page,
        navigationMenu,
        saveModal,
        previewSection,
        formDescription,
    }) => {
        const formName = 'PROMIS SF v1.0 - Applied Cog Abilities 4a';
        const questionName = 'McGill Quality of Life Questionnaire (MQOL) - troublesome physical symptom problem score';
        const versionInfo: Version = {
            newVersion: '',
            changeNote: '[verify form answer list]',
        };

        await test.step(`Navigate to Form description and login`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await previewSection.editFormDescriptionButton().click();
        });

        await test.step(`Add question`, async () => {
            await formDescription.addQuestionToSection(questionName, 0);
        });

        await test.step(`Verify answer list`, async () => {
            await expect(
                page
                    .locator(`#question_0-0 .answerList`)
                    .getByRole('gridcell')
                    .locator('.mdc-evolution-chip__text-label')
            ).toHaveText(['no problem', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'tremendous problem']);
        });
    });

    test(`delete answer list`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
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
            await formDescription.backToPreviewButton().click();
            await saveModal.publishNewVersionByType('form', versionInfo);
        });

        await test.step(`Verify Form`, async () => {
            for (const answerToBeDeleted of answersToBeDeleted) {
                await expect(page.getByText(answerToBeDeleted)).toBeHidden();
            }
        });
    });
});
