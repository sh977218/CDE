import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe(`@a11y accessibility test`, async () => {
    test(`Home page`, async () => {});

    test(`CDE view page`, async ({ navigationMenu }) => {
        const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
        await navigationMenu.gotoCdeByName(cdeName);
    });

    test(`Form view page`, async ({ navigationMenu }) => {
        const formName = 'AED Resistance Log';
        await navigationMenu.gotoFormByName(formName);
    });

    test(`CDE search page`, async ({ page, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.browseOrganization('caBIG');
        await expect(searchPage.classificationFilterByNameAndNumber('caDSR')).toBeVisible();
        await searchPage.nihEndorsedCheckbox().check();
        await searchPage.registrationStatusFilterInput('Qualified').click();
        await searchPage.dataTypeFilterInput('Date').click();
        await page.getByText('results. Sorted by relevance.').isVisible();
    });

    test(`Form search page`, async ({ page, navigationMenu, searchPage }) => {
        await navigationMenu.gotoFormSearch();
        await searchPage.browseOrganization('PROMIS / Neuro-QOL');
        await page.getByRole('link', { name: 'PROMIS Instruments' }).click();
        await page.getByRole('link', { name: 'Adult Short Forms' }).click();
        await page.getByRole('link', { name: 'Social Health' }).click();
        await searchPage.registrationStatusFilterInput('Qualified').click();
        await page.getByText('results. Sorted by relevance.').isVisible();
    });

    test.afterEach(async ({ page }, testInfo) => {
        await test.step(`Run axe check`, async () => {
            const axe = new AxeBuilder({ page });
            const result = await axe.include(`nih-cde`).analyze();

            expect(result.violations.length, {
                message: `
                test name: ${testInfo.title}
               ${JSON.stringify(result.violations, null, 4)}
                `,
            }).toBeLessThanOrEqual(0);
        });
    });
});
