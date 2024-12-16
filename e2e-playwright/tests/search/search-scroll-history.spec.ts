import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

test.use({ viewport: { width: 1000, height: 500 } });
test(`Search page reserve scroll history`, async ({ page, navigationMenu, searchPage }) => {
    test.slow();
    const elementId = `[id="linkToElt_4"]`;
    let appleOffset = -1;
    let patientOffset = -1;
    let painOffset = -1;

    await test.step(`Search CDE and click result`, async () => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill('apple');
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('Godin Leisure-Time Exercise Questionnaire')).not.toHaveCount(0);
        await page.locator(elementId).scrollIntoViewIfNeeded();
        appleOffset = await page.evaluate(() => window.scrollY);
        await page.locator(elementId).click();
    });

    await test.step(`Search Form and click result`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchQueryInput().fill('patient');
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('Patient Health Questionnaire')).not.toHaveCount(0);
        await page.locator(elementId).scrollIntoViewIfNeeded();
        patientOffset = await page.evaluate(() => window.scrollY);
        await page.locator(elementId).click();
    });

    await test.step(`Search another CDE and click result`, async () => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill('Test of Memory Malingering (TOMM) - Trial');
        await searchPage.searchSubmitButton().click();
        await expect(page.getByText('Test of Memory Malingering (TOMM) - Trial')).not.toHaveCount(0);
        await page.locator(elementId).scrollIntoViewIfNeeded();
        painOffset = await page.evaluate(() => window.scrollY);
    });

    await test.step(`Verify scroll Y`, async () => {
        await page.reload();
        await page.waitForTimeout(5000); // wait for page auto scroll happens
        let currentOffset = await page.evaluate(() => window.scrollY);
        expect(currentOffset).toBe(painOffset);
        await page.goBack();
        await page.goBack();
        await page.goBack();
        await page.waitForTimeout(5000); // wait for page auto scroll happens
        await expect(await page.evaluate(() => window.scrollY)).toBe(patientOffset);
        await page.goBack();
        await page.goBack();
        await page.goBack();
        await page.waitForTimeout(5000); // wait for page auto scroll happens
        await expect(await page.evaluate(() => window.scrollY)).toBe(appleOffset);
    });
});
