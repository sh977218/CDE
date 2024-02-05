import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test(`Regular user cannot see create`, async ({ navigationMenu }) => {
    await test.step(`Login with long user name`, async () => {
        await navigationMenu.login(Accounts.longUsernameUser);
    });
    await test.step(`Cannot see Create Elt link on navigation`, async () => {
        await expect(navigationMenu.createButton()).toBeHidden();
    });
});
