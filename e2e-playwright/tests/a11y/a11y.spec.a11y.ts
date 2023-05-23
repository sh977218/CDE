import test from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import cdeTinyId from '../../data/cde-tinyId';
import formTinyId from '../../data/form-tinyId';

test.describe(`a11y`, async () => {
    test(`Home page`, async ({basePage}) => {
        await basePage.goToHome();
    })

    test(`Cde page`, async ({cdePage}) => {
        const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
        await cdePage.goToCde(cdeTinyId[cdeName]);
    })

    test(`Form page`, async ({formPage}) => {
        const formName = 'AED Resistance Log';
        await formPage.goToForm(formTinyId[formName]);
    })

    test.afterEach(async ({basePage, page}, testInfo) => {
        await test.step(`Run axe check`, async () => {
            const axe = new AxeBuilder({page})
            const result = await axe.analyze();
            result.violations.forEach((violation, i) => {
                console.log(`
                test name: ${testInfo.title}
                ${JSON.stringify(violation, null, 4)}
                `);
            })
            if (testInfo.title.includes('Home page')) {
                expect(result.violations.length).toBeLessThanOrEqual(2);
            } else {
                expect(result.violations.length).toBeLessThanOrEqual(12);
            }
        })
    })
})
