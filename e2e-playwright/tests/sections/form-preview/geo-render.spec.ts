import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Geo location render`, async ({ page, navigationMenu, previewSection, formDescription }) => {
    const formName = 'Geo Location Test';
    const geoCdeName = 'Geo Location CDE';

    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
    });

    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
    });

    await test.step(`Add new section`, async () => {
        await formDescription.addSection('Geo Section');
    });

    await test.step(`Add geo location CDE`, async () => {
        await formDescription.addQuestionToSection(geoCdeName, 0);
    });

    await test.step(`Go back to preview`, async () => {
        await formDescription.backToPreviewButton().click();
    });

    await test.step(`Verify preview`, async () => {
        await expect(previewSection.geoLocator()).toBeVisible();
    });
});
