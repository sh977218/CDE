import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Cannot create duplicate user`, async ({ navigationMenu, settingMenu, usersPage }) => {
    const existingUsername = Accounts.regularUser.username;
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoSettings();
    await settingMenu.usersMenu().click();

    await test.step(`Create user`, async () => {
        await usersPage.createUserByUsername(existingUsername, true);
    });
});
