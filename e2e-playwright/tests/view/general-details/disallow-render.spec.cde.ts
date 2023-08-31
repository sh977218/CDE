import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import formTinyId from '../../../data/form-tinyId';

const message = 'info We do not have permission to display this form due to copyright/licensing restrictions. For more information, see the Copyright section below.'

test.describe(`Edit Disallow Rendering`, async () => {
    test(`Not logged in`, async ({formPage}) => {
        const formName = 'Short Form 36-Item Health Survey (SF-36)';
        await formPage.goToForm(formTinyId[formName]);
        await test.expect(formPage.disallowRenderingText()).toHaveText(message)
    })

    test.describe(`Logged in`, async () => {
        test(`Regular user cannot edit`, async ({formPage, navigationMenu, saveModal}) => {
            const formName = 'Short Form 36-Item Health Survey (SF-36)';
            await formPage.goToForm(formTinyId[formName]);
            await navigationMenu.login(user.regularUser.username, user.regularUser.password);
            await test.expect(formPage.disallowRenderingCheckbox()).toBeHidden();
        })

        test.describe(`Can edit`, async () => {
            test(`OrgAuthority user`, async ({formPage, navigationMenu, saveModal}) => {
                const formName = 'Disallow render form';
                await formPage.goToForm(formTinyId[formName]);
                await navigationMenu.login(user.orgAuthority.username, user.orgAuthority.password);
                await test.expect(formPage.disallowRenderingText()).toBeHidden();
                await formPage.disallowRenderingCheckbox().check();
                await formPage.publishDraft().click();
                await saveModal.newVersion('2');
            })
            test(`NlmCurator user`, async ({formPage, navigationMenu}) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await formPage.goToForm(formTinyId[formName]);
                await navigationMenu.login(user.nlmCurator.username, user.nlmCurator.password);
                await test.expect(formPage.disallowRenderingText()).toHaveText(message)
                await test.expect(formPage.disallowRenderingCheckbox()).toBeEnabled();
            })
            test(`SiteAdmin user`, async ({formPage, navigationMenu}) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await formPage.goToForm(formTinyId[formName]);
                await navigationMenu.login(user.nlm.username, user.nlm.password);
            })

            test.afterEach(async ({formPage}) => {
                await test.expect(formPage.disallowRenderingText()).toHaveText(message)
                await test.expect(formPage.disallowRenderingCheckbox()).toBeVisible();
            })
        })
    })
});
