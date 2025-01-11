import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test(`From add subform`, async ({ saveModal, navigationMenu, previewSection, formDescription }) => {
    test.slow();
    const formName = 'Study Drug Compliance';
    const subformName = 'Vessel Imaging Angiography';
    const newFormLabel = 'new inner form label';

    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
    });
    await test.step(`Go to form description`, async () => {
        await previewSection.goToFormDescription();
    });

    await test.step(`Add new subform`, async () => {
        await formDescription.addSubformByNameBeforeId(subformName, 1);
    });

    await test.step(`Edit subform`, async () => {
        await formDescription.startEditSubformByLabel(subformName);
        await formDescription.editSectionLabelByIndex('form_0-0', newFormLabel);
    });

    await test.step(`Save form`, async () => {
        await formDescription.backToPreviewButton().click();
    });

    await test.step(`Verify new subform label`, async () => {
        await expect(previewSection.previewDiv()).toContainText(newFormLabel);
    });
});
