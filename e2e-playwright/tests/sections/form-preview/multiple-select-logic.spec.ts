import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Multiple select logic render`, async ({
    page,
    materialPage,
    navigationMenu,
    previewSection,
    formDescription,
}) => {
    const formName = 'MultiSelect Logic';
    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`toggle print view off`, async () => {
        await previewSection.togglePrintView();
    });

    await test.step(`verify non print view`, async () => {
        await test.step(`verify 'Medicare' logic`, async () => {
            const answerWillBeShown = 'Discharge post acute location';
            await expect(previewSection.questionLabel().nth(1)).toBeHidden();
            await previewSection.previewDiv().getByTitle('Medicare').check();
            await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
            await expect(previewSection.previewDiv()).toContainText(`Own home with self care`);
        });

        await test.step(`verify 'Veterans Affairs Toxicity Scale - gait score' logic`, async () => {
            const answerWillBeShown = 'Veterans Affairs Toxicity Scale - gait score';
            await expect(previewSection.questionLabel().nth(1)).not.toContainText(answerWillBeShown);
            await previewSection.previewDiv().getByTitle('Veterans Affairs/Military').check();
            await expect(previewSection.questionLabel().nth(1)).toContainText(answerWillBeShown);
            await expect(previewSection.previewDiv()).toContainText(`Own home with self care`);
            await expect(previewSection.previewDiv()).toContainText(`Slight ataxia (slowness or unsteady turning)`);
        });
    });
});
