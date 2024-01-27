import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { checkSubmissionValidationReport } from '../../pages/submission/submissionEdit.po';
import { button } from '../../pages/util';
import { Accounts } from '../../data/user';

function bannerErrorMessage(text: string) {
    return "//*[contains(@class, 'alert')][text()[normalize-space()='" + text + "']]";
}

test.describe.configure({ retries: 0 }); // no retries for edits
test.use({ video: 'on', trace: 'on' });

test.describe(`Submission Edit`, async () => {
    test.beforeEach(async ({ page, navigationMenu, submissionManagePage }) => {
        await navigationMenu.login(Accounts.nlmCurator);
        await navigationMenu.gotoSubmissions();
        await submissionManagePage.isSubmissionManagementCurator();
    });

    test('Create', async ({ page, materialPage, submissionManagePage, submissionEditPage }) => {
        await submissionManagePage.submissionNew();

        // Page 1
        await button(page, 'Next').first().click();
        expect(await page.locator('.alert').textContent()).toContain(
            'Please complete all required fields. Missing Fields marked "Incomplete".'
        );

        await page.getByLabel('Collection Title - Incomplete').fill('New Collection 1');
        await page.getByLabel('Collection URL - Incomplete').fill('ci.cde.nlm.nih.gov');
        await page.getByLabel('Version Number - Incomplete').fill('1a');
        await page.getByLabel('Collection Description - Incomplete').fill('this is a test');
        await page.getByLabel('NIH ICO or NIH Wide Initiative - Incomplete').fill('CI');

        await button(page, 'Next').first().click();
        await materialPage.checkAlert('Progress Saved');
        submissionEditPage.isEdit();

        // Page 2
        await button(page, 'Next').nth(1).click();
        await expect(page.locator('.alert')).toContainText(
            'Please complete all required fields. Missing Fields marked "Incomplete".'
        );

        await page.getByLabel('Submitter Email - Incomplete').fill('ci@cde.none');
        await page.getByLabel('Submitter Organization - Incomplete').fill('CI Test');
        await page.getByLabel('First Name - Incomplete').first().fill('Continuous');
        await page.getByLabel('Last Name - Incomplete').first().fill('Integration');

        await expect(page.locator('//label[contains(., "Organization POC Email - Incomplete")]')).toBeVisible();
        await page.getByLabel('Same as the Submitter POC').check();
        await page.getByLabel('Organization URL - Incomplete').fill('ci.cde.nlm.nih.gov');

        await page.getByLabel('NLM Curators - Incomplete').click();
        await materialPage.matOptionByText('nlmCurator').click();

        await page.getByLabel('NIH Governance Committee Reviewers - Incomplete').click();
        await materialPage.matOptionByText('governanceUser').click();

        await button(page, 'Next').nth(1).click();
        await materialPage.checkAlert('Progress Saved');

        // Page 3
        await button(page, 'Next').nth(2).click();
        await expect(page.locator('.alert')).toContainText(
            'Please complete all required fields. Missing Fields marked "Incomplete".'
        );

        await expect(
            page.locator(
                '//label[contains(., "Does any part of this submission have license or copyright restrictions? - Incomplete")]'
            )
        ).toBeVisible();
        await page.getByLabel('Other').check();
        await page.getByLabel('Licensing/Copyright Description - Incomplete').first().fill('Praise CI');
        await expect(page.locator('//label[contains(., "Upload Collection File - Incomplete")]')).toBeVisible();
        // attach good workbook
        // await button(page, 'Next').nth(2).click();

        await page.locator('mat-step-header').nth(3).click();

        // Page 4
        await button(page, 'Submit').click();
        await expect(
            page.locator(
                bannerErrorMessage('Please complete all required fields on page 3. Missing Fields marked "Incomplete".')
            )
        ).toBeVisible();

        await expect(
            page.locator('//dt[contains(.,"License")]/following-sibling::dd[contains(., "Other")]')
        ).toBeVisible();
    });

    test('Edit', async ({ page, submissionManagePage }) => {
        await submissionManagePage.submissionEdit('nlm', '1');
        await page.getByLabel('Version Number').fill('1.1');
        await button(page, 'Save').first().click();
        await submissionManagePage.isSubmissionManagementCurator();
        await submissionManagePage.submissionEdit('nlm', '1.1');
    });

    test('Validate', async ({ page, materialPage, submissionManagePage }) => {
        await submissionManagePage.submissionEdit('NLM', '1');
        await page.locator('mat-step-header').nth(2).click();
        await page.setInputFiles(
            '[id="fileWorkbook"]',
            './e2e-playwright/assets/ScHARe CDE Governance Submission Form 2023-07-25 for dev team.xlsx'
        );
        await materialPage.checkAlert('Attachment Saved');
        await checkSubmissionValidationReport(page, materialPage);
        await button(page, 'Next').nth(2).click();
        await expect(
            page.locator(
                bannerErrorMessage(
                    'There are blocking errors in the Workbook file. Please see the report below and address.'
                )
            )
        ).toBeVisible();

        await page.locator('mat-step-header').nth(3).click();
        await button(page, 'Submit').click();
        await expect(
            page.locator(
                bannerErrorMessage('Please complete all required fields on page 3. Missing Fields marked "Incomplete".')
            )
        ).toBeVisible();
    });
});
