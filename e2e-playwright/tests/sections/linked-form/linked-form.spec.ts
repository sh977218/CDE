import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`linked form`, async () => {
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
});
