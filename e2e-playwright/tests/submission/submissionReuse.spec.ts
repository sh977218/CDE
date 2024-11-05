import { expect, Page } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';
import { button, tag } from '../../pages/util';

test.describe.configure({ retries: 0 }); // no retries for edits
test.use({ video: 'on', trace: 'on' });
test.describe(`Submission Reuse`, async () => {
    test.beforeEach(async ({page, navigationMenu, submissionManagePage}) => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoSubmissions();
        await submissionManagePage.isSubmissionManagementCurator();
    });

    test('Reuse fail', async ({page, materialPage, submissionManagePage, submissionEditPage}) => {
        await submissionManagePage.submissionEdit('reuseSubmission', '1');
        await page.locator('mat-step-header').nth(2).click();
        await button(page, 'Validate').click();
        await expect(tag(page, 'h1', 'Summary of Errors')).toBeVisible();
        await expect(tag(page, 'h2', 'Critical Errors')).toBeVisible();
        await expect(tag(page, 'li', 'Reuse Data Element Mismatch: 10')).toBeVisible();
        await expect(page.locator('li').getByText('Classification requires at least 2 items or none. Cannot be 1. Row(s) 4, 5, 6')).toBeVisible();
        await expect(page.locator('li').getByText('edTY67FZ_: New Permissible Value "Vitamin A" not found in existing Row(s) 4')).toBeVisible();
        await expect(page.locator('li').getByText('edTY67FZ_: Existing Permissible Value "vitamin A" not found in submission Row(s) 4')).toBeVisible();
        await expect(page.locator('li').getByText('Data element BypIL8Xk does not exist Row(s) 5')).toBeVisible();
        await expect(page.locator('li').getByText('c9iYiWGJm: Cannot reuse a bundled data element without a bundle Row(s) 6')).toBeVisible();
        await expect(page.locator('li').getByText('c9iYiWGJm: No match for submission concept UMLS:C5203676 Row(s) 6')).toBeVisible();
        await expect(page.locator('li').getByText('c9iYiWGJm: Submitted unit of measure "mL" does not match existing "m" Row(s) 6')).toBeVisible();
        await expect(page.locator('li').getByText('Data element J4kf8HzgS is not endorsed. Must be endorsed to reuse. Row(s) 7')).toBeVisible();
        await expect(page.locator('li').getByText('8LvFANOfl: New preferred designation "reuseSubmission" does not match existing "reuseSubmission E" Row(s) 8')).toBeVisible();
        await expect(page.locator('li').getByText('8LvFANOfl: New datatype "Date" does not match existing "Text" Row(s) 8')).toBeVisible();
        await expect(page.locator('li').getByText('8LvFANOfl: Cannot reuse a not-bundled data element for a bundle Row(s) 8')).toBeVisible();

        await page.locator('mat-step-header').nth(3).click();
        await validatePreviewDeA(page);
        await expect(page.locator('cde-classification-view a').getByText('MISSING CLASSIFICATION').first()).toBeVisible();

        await expect(page.locator('a').getByText('BypIL8Xk').last()).toBeVisible();
        await expect(page.locator('a').getByText('c9iYiWGJm').last()).toBeVisible();
        await expect(page.locator('a').getByText('8LvFANOfl').last()).toBeVisible();
        await expect(page.locator('mat-panel-title').getByText('combo', { exact: true })).toBeVisible();
        await expect(page.locator('mat-panel-title').getByText('another combo')).toBeVisible();
        await expect(page.locator('mat-panel-title').getByText('not a combo')).toBeVisible();
    });

    test('Reuse success', async ({page, materialPage, submissionManagePage, submissionEditPage}) => {
        await submissionManagePage.submissionEdit('reuseSubmission', '1');
        await page.locator('mat-step-header').nth(2).click();
        await page.setInputFiles(
            '[id="fileWorkbook"]',
            './e2e-playwright/assets/reuseSubmission2.xlsx'
        );
        await materialPage.checkAlert('Attachment Saved');
        await expect(page.locator('cde-submission-workbook-validation-report')).toContainText('No critical errors found');
        await button(page, 'Next').nth(2).click();
        await validatePreviewDeA(page);
        await expect(page.locator('cde-classification-view a').getByText('CC').first()).toBeVisible();
        await expect(page.locator('cde-classification-view a').getByText('CCA').first()).toBeVisible();

        const form1 = page.locator('mat-panel-title').getByText('reuseSubmission combo 1');
        await expect(form1.locator('a').getByText('w8lj0M8sC')).toBeVisible();

        const form2 = page.locator('mat-panel-title').getByText('reuseSubmission combo 2');
        await expect(form2.locator('a').getByText('Reused:')).not.toBeVisible();

        await page.locator('button').getByText('Endorse').click();

        await page.goto('http://localhost:3001/cde/search?selectedOrg=reuseSubmission');
        await expect(page.getByText('6 results. Sorted by relevance.')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission A')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission B')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission C')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission D')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission E')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission F')).toBeVisible();
        await page.locator('a').getByText('reuseSubmission A').click();
        await expect(page.locator('cde-classification-view a').getByText('NLM CDE Dev Team Test').first()).toBeVisible();
        await expect(page.locator('cde-classification-view a').getByText('reuseSubmission').first()).toBeVisible();
        await expect(page.locator('cde-classification-view a').getByText('CCBB').first()).toBeVisible();

        await page.goto('http://localhost:3001/cde/search?q=reuseSubmission');
        await expect(page.getByText('8 results. Sorted by relevance.')).toBeVisible();
        expect(await page.locator('a').getByText('reuseSubmission D').count()).toBe(2);
        expect(await page.locator('a').getByText('reuseSubmission F').count()).toBe(2);

        await page.goto('http://localhost:3001/form/search?selectedOrg=reuseSubmission');
        await expect(page.locator('a').getByText('reuseSubmission combo 1')).toBeVisible();
        await expect(page.locator('a').getByText('reuseSubmission combo 2')).toBeVisible();
        await page.locator('a').getByText('reuseSubmission combo 1').click();
        await expect(page.locator('cde-classification-view a').getByText('NLM CDE Dev Team Test').first()).toBeVisible();
        await expect(page.locator('cde-classification-view a').getByText('reuseSubmission').first()).toBeVisible();

        // TODO: check cde and form audit
    });
});

async function validatePreviewDeA(page: Page) {
    const deA = page.locator('mat-panel-title').getByText('reuseSubmission A');
    await expect(deA.locator('small').getByText('part of a bundle')).toBeVisible();
    await expect(deA.locator('a').getByText('edTY67FZ_')).toBeVisible();
    await deA.click();
    await expect(page.locator('cde-classification-view a').getByText('reuseSubmission').first()).toBeVisible();
    await expect(page.locator('cde-classification-view a').getByText('CCBB').first()).toBeVisible();
}
