import user from '../../data/user';
import test from '../../fixtures/base-fixtures';
import { checkSubmissionValidationReport } from '../../pages/submission/submissionEdit.po';

test.describe.configure({ retries: 0 }); // no retries for edits

test.describe(`Submission Workbook Validator`, async () => {
    test('Validate', async ({ page, homePage, materialPage, navigationMenu }) => {
        await homePage.goToHome();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await navigationMenu.gotoSettings();
        await navigationMenu.gotoSettingsSubmissionWorkbookValidation();
        await page.setInputFiles(
            '[id="fileToValidate"]',
            './e2e-playwright/assets/ScHARe CDE Governance Submission Form 2023-07-25 for dev team.xlsx'
        );
        await checkSubmissionValidationReport(page, materialPage);
    });
});
