import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';
import { Accounts } from '../../../data/user';

test(`Form reorder answer list`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
    const formName = `Answer List Test`;
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[reorder form answer list]',
    };

    await test.step(`Navigate to Form description and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.testEditor);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await previewSection.editFormDescriptionButton().click();
    });

    await test.step(`Reorder answer list`, async () => {
        await formDescription.startEditQuestionById('question_0-0');
        await expect(page.locator(`#question_0-0`).getByRole('row')).toContainText([
            `Female Gender`,
            `Male Gender`,
            `Unknown`,
        ]);
        await formDescription.reorderAnswerListByIndex('question_0-0', 1, 'Move up');
    });

    await test.step(`Save form`, async () => {
        await formDescription.saveFormEdit();
        await saveModal.newVersion('Form saved.', versionInfo);
    });

    await test.step(`Verify Form`, async () => {
        await expect(page.locator(`//*[@id="Patient Gender Category_0-0"]`).locator('label')).toHaveText([
            `Male Gender`,
            `Female Gender`,
            `Unknown`,
        ]);
    });
});
