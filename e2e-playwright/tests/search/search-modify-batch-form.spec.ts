import { expect } from '@playwright/test';
import { Accounts } from '../../../e2e-playwright/data/user';
import { test } from '../../../e2e-playwright/fixtures/base-fixtures';
import { button, id, xpathHasText } from '../../../e2e-playwright/pages/util';

test(`Modify All Form`, async ({ page, materialPage, navigationMenu, auditTab, searchPage }) => {
    await test.step(`modify all`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormSearch();
        await id(page, 'browseOrg-NINDS').click();
        await searchPage.classificationChild('Domain').click();
        await searchPage.classificationChild('Participant Characteristics').click();
        await searchPage.registrationStatusFilter('Qualified').click();
        await searchPage.administrativeStatus('Published').click();
        await expect(searchPage.searchResultNumber()).toHaveText('2');
        await button(page, 'Modify All').click();

        // const regStatusDiv = has(page, 'div', div => tag(div, 'span', 'Registration Status:'));
        const regStatusDiv = page.locator('//div[span' + xpathHasText('Registration Status:') + ']');
        await button(regStatusDiv, 'Change').click();
        await regStatusDiv.locator('select').selectOption('Standard');

        // const adminStatusDiv = has(page, 'div', div => tag(div, 'span', 'Administrative Status:'));
        const adminStatusDiv = page.locator('//div[span' + xpathHasText('Administrative Status:') + ']');
        await button(adminStatusDiv, 'Change').click();
        await adminStatusDiv.locator('select').selectOption('Released');

        await button(materialPage.matDialog(), 'Modify All').click();
        await expect(materialPage.matDialog()).toContainText('Selected: 2 Forms');
        await expect(materialPage.matDialog()).toContainText('Registration Status:');
        await expect(materialPage.matDialog()).toContainText('From: Qualified');
        await expect(materialPage.matDialog()).toContainText('To: Standard');
        await expect(materialPage.matDialog()).toContainText('Administrative Status:');
        await expect(materialPage.matDialog()).toContainText('From: Published');
        await expect(materialPage.matDialog()).toContainText('To: Released');
        await button(materialPage.matDialog(), 'Submit').click();
        await materialPage.checkAlert('Batch Modification finished');

        await page.reload();
        await expect(page.locator('.searchResultsView h1')).toContainText('No results were found');
        await page.getByTestId('active-filter-registration-status').click();
        await page.getByTestId('active-filter-administrative-status').click();
        await searchPage.registrationStatusFilter('Standard').click();
        await searchPage.administrativeStatus('Released').click();
        await expect(searchPage.searchResultNumber()).toHaveText('2');

        await id(page, 'linkToElt_0').click();
        await expect(page.locator('cde-form-view')).toContainText('ON THIS PAGE');
        await expect(page.locator(`[itemprop="registrationStatus"]`)).toHaveText('Standard');
        await expect(page.locator(`[itemprop="administrativeStatus"]`)).toHaveText('Released');
        await expect(page.locator('cde-history')).toContainText('Batch update from search');
    });

    await test.step(`audit`, async () => {
        await navigationMenu.gotoAudit();
        await auditTab.appLogs().click();
        await button(page.locator('cde-app-log'), 'Submit').click();
        await expect(page.locator('cde-app-log')).toContainText('Running Batch Modify from search "/form/search?');

        await auditTab.formAuditLog().click();
        await button(page.locator('cde-item-log'), 'Search').click();
        await expect(page.locator('cde-item-log')).toContainText('Demographics');
        await expect(page.locator('cde-item-log')).toContainText('General Core');
    });
});
