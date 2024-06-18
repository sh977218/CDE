import { test } from '../../fixtures/base-fixtures';
import { checkSubmissionValidationReport } from '../../pages/submission/submissionEdit.po';
import { Accounts } from '../../data/user';

test.describe.configure({ retries: 0 }); // no retries for edits

test.describe(`Submission Workbook Validator`, async () => {
    test('Validate', async ({ page, materialPage, navigationMenu }) => {
        await navigationMenu.login(Accounts.nlmCurator);
        await navigationMenu.gotoSettings();
        await navigationMenu.gotoSettingsSubmissionWorkbookValidation();
        await page.setInputFiles(
            '[id="fileToValidate"]',
            './e2e-playwright/assets/ScHARe CDE Governance Submission Form 2023-07-25 for dev team.xlsx'
        );
        await checkSubmissionValidationReport(page, materialPage);
    });
});
