import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`search preferences`, async () => {
    test.describe(`Should not see`, async () => {
        test.beforeEach(async ({basePage}) => {
            await basePage.goToHome();
        })

        test(`Logout user`, async () => {
        })

        test(`Regular user`, async ({navigationMenu}) => {
            await navigationMenu.login(user.regularUser.username, user.regularUser.password);
        })

        test.afterEach(async ({navigationMenu}) => {
            await test.expect(navigationMenu.searchPreferencesButton()).toBeHidden();
        })
    });

    test.describe(`Should see`, async () => {
        test.beforeEach(async ({basePage}) => {
            await basePage.goToHome();
        })
        test(`Site admin`, async ({navigationMenu}) => {
            await navigationMenu.login(user.nlm.username, user.nlm.password);
        })
        test(`Org authority`, async ({navigationMenu}) => {
            await navigationMenu.login(user.orgAuthority.username, user.orgAuthority.password);
        })

        test.afterEach(async ({navigationMenu}) => {
            await test.expect(navigationMenu.searchPreferencesButton()).toBeVisible();
        })

    })

});
