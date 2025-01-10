import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Form empty logic`, async () => {
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
            await formDescription.addEmptyQuestionLogicByIndex([
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
                await expect(previewSection.questionLabel().nth(1)).toContainText(`Data unknown indicator`);
                await previewSection.previewDiv().getByTitle('Birth date').fill('1995-01-01');
                await expect(previewSection.questionLabel().nth(1)).not.toContainText(`Data unknown indicator`);
            });

            await test.step(`value lists`, async () => {
                await expect(previewSection.questionLabel().nth(2)).toContainText(
                    `Pulmonary function test not done reason`
                );
                await previewSection.previewDiv().getByRole('radio', { name: 'No: C49487' }).click();
                await expect(previewSection.questionLabel().nth(2)).not.toContainText(
                    `Pulmonary function test not done reason`
                );
            });

            await test.step(`numbers`, async () => {
                await expect(previewSection.questionLabel().nth(3)).toContainText(
                    `Pulmonary function test not done other text`
                );
                await previewSection.previewDiv().getByTitle('Head injury prior number').fill('0');
                await expect(previewSection.questionLabel().nth(3)).not.toContainText(
                    `Pulmonary function test not done other text`
                );
            });

            await test.step(`text`, async () => {
                await expect(previewSection.questionLabel().nth(4)).toContainText(`Perianal problem other text`);
                await previewSection.previewDiv().getByTitle('Noncompliant Reason Text').fill('abc');
                await expect(previewSection.questionLabel().nth(4)).toBeHidden();
            });
        });
    });
});
