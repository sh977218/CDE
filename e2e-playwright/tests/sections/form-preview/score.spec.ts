import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`Form score`, async () => {
    test(`BMI`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Body Mass Index';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`Verify score @TODO preview form is not updated reactively`, async () => {
            await previewSection.formRenderDiv().getByTitle('Weight').fill('180');
            await previewSection.formRenderDiv().getByLabel('pound').click();
            await expect(previewSection.formRenderDiv()).toContainText('Score: Select unit of measurement for weight');

            await previewSection.formRenderDiv().getByLabel('[in_i]').click();
            await previewSection.formRenderDiv().getByTitle('Height').fill('70');
            await page.keyboard.press('Tab');

            await expect(previewSection.formRenderDiv()).toContainText('Score: 25.827');
        });
    });

    test(`mean value`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Mean Value Test';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName, true);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`Verify score`, async () => {
            await previewSection.formRenderDiv().getByTitle('Temperature measurement').fill('8');

            await previewSection.formRenderDiv().getByTitle('Temperature maximum daily measurement').focus();
            await expect(previewSection.formRenderDiv()).toContainText('Score: Incomplete answers');

            await previewSection.formRenderDiv().getByTitle('Temperature maximum daily measurement').fill('11');
            await page.keyboard.press('Tab');
            await expect(previewSection.formRenderDiv()).toContainText('Score: 9.5');
        });
    });

    test(`total score`, async ({ page, navigationMenu, previewSection }) => {
        const formName = 'Apathy Scale (AS)';
        await test.step(`Navigate to Form and login`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
            await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        });

        await test.step(`Verify score`, async () => {
            await previewSection.formRenderDiv().getByLabel('2=Slightly').click();
            await previewSection
                .formRenderDiv()
                .locator('[id="Apathy Scale (AS) - indifference indicator_0-1"]')
                .getByLabel('=Slightly')
                .click();
            await previewSection
                .formRenderDiv()
                .locator('[id="Apathy Scale (AS) - apathetic indicator_0-2"]')
                .getByLabel('=A lot')
                .click();
            await page.keyboard.press('Tab');
            await expect(previewSection.formRenderDiv()).toContainText('Score: 6');
        });
    });
});
