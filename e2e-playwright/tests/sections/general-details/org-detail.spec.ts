import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`Org detail`, async () => {
    test(`CDE page`, async ({ materialPage, navigationMenu, generateDetailsSection }) => {
        const matTooltip = materialPage.matTooltip();
        const cdeName = 'Feature Modified By java.lang.String';
        await navigationMenu.gotoCdeByName(cdeName);
        await generateDetailsSection.stewardOrg().hover();
        await expect(matTooltip).toContainText('Organization Details');
        await expect(matTooltip).toContainText('Cancer Biomedical Informatics Grid');
        await expect(matTooltip).toContainText('123 Somewhere On Earth, Abc, Def, 20001');
        await expect(matTooltip).toContainText('caBig@nih.gov');
        await expect(matTooltip).toContainText('111-222-3333');
        await expect(matTooltip).toContainText('https://cabig.nci.nih.gov/');
    });
});
