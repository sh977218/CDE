import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test.describe(`From add section`, async () => {
    test(`repeat F`, async ({ saveModal, navigationMenu, previewSection, formDescription }) => {
        test.fixme();
        const formName = 'Section Test Form3';
        const sectionName = 'section 3';

        await test.step(`Login and navigate to form`, async () => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
        });

        await test.step(`Go to form description`, async () => {
            await previewSection.goToFormDescription();
        });

        await test.step(`Add new sections`, async () => {
            await formDescription.addSectionBottom(sectionName, 'F');
            await formDescription.addQuestionToSection('reuseSubmission A', 2);
        });

        await test.step(`Save form`, async () => {
            await formDescription.backToPreviewButton().click();
        });

        await test.step(`Verify new subform label`, async () => {
            await expect(previewSection.previewDiv().locator('table tbody tr')).toHaveCount(2);
        });
    });

    test(`repeat 2 times`, async ({ saveModal, navigationMenu, previewSection, formDescription }) => {
        const formName = 'Section Test Form';
        const sectionName = 'section 1';

        await test.step(`Login and navigate to form`, async () => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
        });

        await test.step(`Go to form description`, async () => {
            await previewSection.goToFormDescription();
        });

        await test.step(`Add new section`, async () => {
            await formDescription.addSection(sectionName, 2);
        });

        await test.step(`Save form`, async () => {
            await formDescription.backToPreviewButton().click();
        });

        await test.step(`Verify new subform label`, async () => {
            await expect(previewSection.previewDiv().locator('table tbody tr')).toHaveCount(2);
        });
    });
});
