import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import cdeTinyId from '../../data/cde-tinyId';
import formTinyId from '../../data/form-tinyId';

test.describe(`a11y`, async () => {
    test(`Home page`, async ({page, basePage}) => {
        await basePage.goToHome();
    })

    test(`Cde page @smoke`, async ({page, basePage}) => {
        const cdeName = 'Family Assessment Device (FAD) - Discuss problem indicator';
        await basePage.goToCde(cdeTinyId[cdeName]);
    })

    test(`Form page`, async ({page, basePage}) => {
        const formName = 'AED Resistance Log';
        await basePage.goToForm(formTinyId[formName]);
    })

    test.afterEach(async ({basePage, page}, testInfo) => {
        await basePage.login(user.nlm.username, user.nlm.password);

        await test.step(`Run axe check`, async () => {
            const axe = new AxeBuilder({page})
            const result = await axe.analyze();
            result.violations.forEach((violation, i) => {
                console.log(`
                test name: ${testInfo.title}
                ${JSON.stringify(violation, null, 4)}
                `);
            })
            expect(result.violations.length).toBeGreaterThan(0);
        })
    })
})
