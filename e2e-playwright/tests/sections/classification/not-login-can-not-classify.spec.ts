import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`Not login cannot classify`, async () => {
    test(`CDE`, async ({ page, materialPage, auditTab, navigationMenu, classificationSection }) => {
        const cdeName =
            'Person Primary Care Evaluation of Mental Disorders Patient Health Questionnaire Total Score Psychometric Questionnaire Two Digit Score';

        await test.step(`Navigate to CDE`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeHidden();
        });
    });
    test(`Form`, async ({ page, materialPage, auditTab, navigationMenu, classificationSection }) => {
        const formName = 'Patient Health Questionnaire 2 item';

        await test.step(`Navigate to CDE`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await expect(page.getByRole('button', { name: 'Classify this Form' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Classify CDEs' })).toBeHidden();
        });
    });
});
