import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`linked form`, async () => {
    test.describe(`CDE`, async () => {
        test(`linked form description truncate text`, async ({ page, navigationMenu }) => {
            const cdeName =
                'Patient Health Questionnaire (PHQ-9) Last Two Weeks How Often Little Interest or Pleasure in Doing Things Score 4 Point Scale';
            await navigationMenu.gotoCdeByName(cdeName);
            const firstLinkedFormLocator = page.locator('cde-summary-list-item').first();
            await expect(firstLinkedFormLocator).toContainText('self-administered version of the PRIME-MD');
            await expect(firstLinkedFormLocator).not.toContainText(
                'No permission required to reproduce, translate, display or distribute.'
            );
        });

        test(`find form by cde`, async ({ page, navigationMenu }) => {
            const cdeName = 'Therapeutic Procedure Created Date java.util.Date';
            const formName = 'Find By CDE';
            await navigationMenu.gotoCdeByName(cdeName);
            await page.getByRole('link', { name: formName }).click();
            await expect(page).toHaveURL(/formView\?tinyId=myIxS474_/);
        });
    });

    test.describe(`Form`, async () => {
        test(`Find form uses current form`, async ({ page, materialPage, navigationMenu }) => {
            const formName = 'Neurological Assessment: TBI Symptoms and Signs';
            await navigationMenu.gotoFormByName(formName, true);
            await page.getByRole('button', { name: 'Linked Forms' }).click();
            const matDialog = materialPage.matDialog();

            await matDialog.waitFor();
            await expect(matDialog.getByText('There is 1 form that uses this form')).toBeVisible();
            await expect(matDialog.getByText('Form In Form Num Questions')).toBeVisible();
            await expect(matDialog.getByText('Neurological Assessment: TBI Symptoms and Signs')).toBeHidden();

            await matDialog.getByRole('button', { name: 'Close' }).click();
            await matDialog.waitFor({ state: 'hidden' });
        });
    });
});
