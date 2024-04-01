import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Spell check`, async ({ page, materialPage, navigationMenu, settingMenu }) => {
    const collectionName = 'new_whitelist';
    await test.step(`add white list`, async () => {
        const terms = ['hello', 'world'];
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.gotoSettings();
        await settingMenu.spellCheckMenu().click();
        await page
            .getByRole('button', {
                name: 'Add a Whitelist',
            })
            .click();
        await materialPage.matDialog().waitFor();
        await materialPage.matDialog().getByPlaceholder(`New Whitelist`).fill(collectionName);
        for (const term of terms) {
            await materialPage.addMatChipRowByName(materialPage.matDialog(), term);
        }
        await materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Save',
            })
            .click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await materialPage.checkAlert(`New Whitelist added`);
    });

    await test.step(`edit white list`, async () => {
        const newTerm = 'new_term';

        await page.getByRole('combobox').click();
        await materialPage.matOptionByText(collectionName).click();
        await page
            .getByRole('button', {
                name: 'View/Edit Whitelist',
            })
            .click();
        await materialPage.matDialog().waitFor();
        await materialPage.addMatChipRowByName(materialPage.matDialog(), newTerm);
        await materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Save Changes',
            })
            .click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await materialPage.checkAlert(`Whitelist updated`);
    });

    await test.step(`copy white list`, async () => {
        const newCollectionName = 'copy_test';

        await page.getByRole('combobox').click();
        await materialPage.matOptionByText(collectionName).click();
        await page
            .getByRole('button', {
                name: 'Copy Whitelist',
            })
            .click();
        await materialPage.matDialog().waitFor();
        await materialPage.matDialog().getByPlaceholder(`New Whitelist`).fill(newCollectionName);
        await materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Save',
            })
            .click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await materialPage.checkAlert(`New Whitelist added`);
    });

    await test.step(`delete white list`, async () => {
        const collectionNameToBeDeleted = 'copy_test';

        await page.getByRole('combobox').click();
        await materialPage.matOptionByText(collectionName).click();
        await page
            .getByRole('button', {
                name: 'Delete Whitelist',
            })
            .click();
        await materialPage.matDialog().waitFor();
        await materialPage
            .matDialog()
            .getByRole('button', {
                name: 'Delete',
            })
            .click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await materialPage.checkAlert(`Whitelist deleted`);
    });
});
