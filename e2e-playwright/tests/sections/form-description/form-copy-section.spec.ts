import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';

test(`Form copy section`, async ({
    page,
    materialPage,
    saveModal,
    navigationMenu,
    previewSection,
    formDescription,
}) => {
    const form1 = 'Loinc Widget Test Form';
    const form2 = 'Copy Section Form Test';

    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[copy form section]',
    };

    await test.step(`Navigate to Form description and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(form1);
    });

    await test.step(`Copy form section`, async () => {
        await previewSection.goToFormDescription();
        await page.locator(`//*[@id='section_1']//mat-icon[normalize-space() = 'content_copy']`).click();
    });

    await test.step(`Phase form section`, async () => {
        await navigationMenu.gotoFormByName(form2);
        await previewSection.goToFormDescription();
        await page
            .locator(`#pasteSection`)
            .dragTo(page.locator(`//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']`));
        await materialPage.checkAlert(`Saved`);
    });

    await test.step(`Save form`, async () => {
        await formDescription.saveFormEdit();
        await saveModal.publishNewVersionByType('form', versionInfo);
    });
    await test.step(`Verify form section`, async () => {
        await navigationMenu.gotoFormByName(form2);
        await expect(page.getByText(`Inside section form: PROMIS SF v1.0 - Phys. Function 10a`)).toBeVisible();
    });
});
