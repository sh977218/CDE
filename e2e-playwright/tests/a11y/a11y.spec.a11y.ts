import test from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import cdeTinyId from '../../data/cde-tinyId';
import formTinyId from '../../data/form-tinyId';

test.describe(`a11y`, async () => {
    test(`Home page`, async ({ homePage }) => {
        await homePage.goToHome();
    });

    test(`CDE view page`, async ({ page, cdePage, searchPage }) => {
        const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
        await cdePage.goToCde(cdeTinyId[cdeName]);
    });

    test(`Form view page`, async ({ page, formPage, searchPage }) => {
        const formName = 'AED Resistance Log';
        await formPage.goToForm(formTinyId[formName]);
    });

    test(`CDE search page`, async ({ page, cdePage, searchPage }) => {
        await searchPage.goToSearch('cde');
        await searchPage.browseOrganization('caBIG');
        await searchPage.classificationFilter('caDSR');
        await searchPage.nihEndorsedCheckbox().check();
        await searchPage.registrationStatusFilter('Qualified').click();
        await searchPage.dataTypeFilter('Date').click();
        await page.getByText('results. Sorted by relevance.').isVisible();
    });

    test(`Form search page`, async ({ page, formPage, searchPage }) => {
        await searchPage.goToSearch('form');
        await searchPage.browseOrganization('PROMIS / Neuro-QOL');
        await searchPage.classificationFilter('PROMIS Instruments');
        await searchPage.classificationFilter('Adult Short Forms');
        await searchPage.classificationFilter('Social Health');
        await searchPage.registrationStatusFilter('Qualified').click();
        await page.getByText('results. Sorted by relevance.').isVisible();
    });

    test.afterEach(async ({ page }, testInfo) => {
        await test.step(`Run axe check`, async () => {
            const axe = new AxeBuilder({ page });
            const result = await axe.analyze();
            result.violations.forEach((violation, i) => {
                console.log(`
                test name: ${testInfo.title}
                ${JSON.stringify(violation, null, 4)}
                `);
            });
            expect(result.violations.length).toBeLessThanOrEqual(0);
        });
    });
});
