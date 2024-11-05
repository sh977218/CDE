import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`CDE page - out of date warning`, async ({ cdePage, navigationMenu }) => {
    const cdeName = '36-item Short Form Health Survey (SF-36) - Bodily pain score';
    await navigationMenu.gotoCdeByName(cdeName);
    await expect(cdePage.outOfDateAlert()).toHaveText(
        'warningWarning: This version of the CDE might be out of date. For the most current version, please visit https://www.commondataelements.ninds.nih.gov'
    );
});
