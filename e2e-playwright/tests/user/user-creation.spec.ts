import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Create UTS user in CDE when not exist`, async ({ navigationMenu }) => {
    await navigationMenu.login(Accounts.userExistingInUtsButNotCDE);
});
