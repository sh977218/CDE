import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { button } from '../../pages/util';

function bannerErrorMessage(text: string) {
    return "//*[contains(@class, 'alert')][text()[normalize-space()='" + text + "']]";
}

test.describe.configure({ retries: 0 }); // no retries for edits

test.describe(`Submission Edit`, async () => {
    test.beforeEach(async ({ page, basePage, navigationMenu, submissionManagePage }) => {
        await basePage.goToHome();
        await navigationMenu.login(user.nlmCurator.username, user.nlmCurator.password);
        await navigationMenu.gotoSubmissions();
        await submissionManagePage.isSubmissionManagementCurator();
    });

    test('Create', async ({ page, basePage, materialPage, snackBar, submissionManagePage, submissionEditPage }) => {
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
        await snackBar.checkAlert('Progress Saved');
        submissionEditPage.isEdit();

        // Page 2
        await button(page, 'Next').nth(1).click();
        expect(await page.locator('.alert').textContent()).toContain(
            'Please complete all required fields. Missing Fields marked "Incomplete".'
        );

        await page.getByLabel('Submitter Email - Incomplete').fill('ci@cde.none');
        await page.getByLabel('Submitter Organization - Incomplete').fill('CI Test');
        await page.getByLabel('First Name - Incomplete').first().fill('Continuous');
        await page.getByLabel('Last Name - Incomplete').first().fill('Integration');

        await basePage.locate('//label[contains(., "Organization POC Email - Incomplete")]');
        await page.getByLabel('Same as the Submitter POC').check();
        await page.getByLabel('Organization URL - Incomplete').fill('ci.cde.nlm.nih.gov');

        await page.getByLabel('NLM Curators - Incomplete').click();
        await materialPage.matOption('nlmCurator').click();

        await page.getByLabel('NIH Governance Committee Reviewers - Incomplete').click();
        await materialPage.matOption('governanceUser').click();

        await button(page, 'Next').nth(1).click();
        await snackBar.checkAlert('Progress Saved');

        // Page 3
        await button(page, 'Next').nth(2).click();
        expect(await page.locator('.alert').textContent()).toContain(
            'Please complete all required fields. Missing Fields marked "Incomplete".'
        );

        await basePage.locate(
            '//label[contains(., "Does any part of this submission have license or copyright restrictions? - Incomplete")]'
        );
        await page.getByLabel('Other').check();
        await page.getByLabel('Licensing/Copyright Description - Incomplete').first().fill('Praise CI');
        await basePage.locate('//label[contains(., "Upload Collection File - Incomplete")]');
        // attach good workbook
        // await button(page, 'Next').nth(2).click();

        await page.locator('mat-step-header').nth(3).click();

        // Page 4
        await button(page, 'Submit').click();
        await basePage.locate(
            bannerErrorMessage('Please complete all required fields on page 3. Missing Fields marked "Incomplete".')
        );

        await basePage.locate('//dt[contains(.,"License")]/following-sibling::dd[contains(., "Other")]');
    });

    test('Edit', async ({ page, snackBar, submissionManagePage }) => {
        await submissionManagePage.submissionEdit('nlm', '1');
        await page.getByLabel('Version Number').fill('1.1');
        await button(page, 'Save').first().click();
        await submissionManagePage.isSubmissionManagementCurator();
        await submissionManagePage.submissionEdit('nlm', '1.1');
    });

    test('Validate', async ({ page, basePage, snackBar, submissionManagePage }) => {
        await submissionManagePage.submissionEdit('NLM', '1');
        await page.locator('mat-step-header').nth(2).click();
        await page.setInputFiles('[id="fileWorkbook"]', './e2e-playwright/assets/ScHARe CDE Governance Submission Form 2023-07-25 for dev team.xlsx');
        await snackBar.checkAlert('Attachment Saved');
        await button(page, 'Download Report').click();
        await snackBar.checkAlert('Report saved. Check downloaded files.');

        await basePage.locate('//h1[text()="Summary of Errors"]');
        await basePage.locate('//h2[text()="Critical Errors"]');
        await basePage.locate('//li[text()="Length of Lists: 12"]');
        await basePage.locate('//li[text()="Required Field: 1"]');
        await basePage.locate('//h1[text()="Critical Errors:"]');
        await basePage.locate('//h2[text()="Length of Lists"]');
        await basePage.locate(
            '//li[text()="There are 7 PV Labels but 8 PV Definitions. Must be the same count. Row(s) 12"]'
        );
        await basePage.locate('//h2[text()="Required Fields"]');
        await basePage.locate(
            '//li[text()="CDE Data Type must be one of the following: Value List, Text, Number, Date, Time, Datetime, Geolocation, File/URI/URL. Row(s) 5"]'
        );

        await button(page, 'Next').nth(2).click();
        await basePage.locate(
            bannerErrorMessage(
                'There are blocking errors in the Workbook file. Please see the report below and address.'
            )
        );

        await page.locator('mat-step-header').nth(3).click();
        await button(page, 'Submit').click();
        await basePage.locate(
            bannerErrorMessage('Please complete all required fields on page 3. Missing Fields marked "Incomplete".')
        );
    });
});
