import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const message =
    'info We do not have permission to display this form due to copyright/licensing restrictions. For more information, see the Copyright section below.';

test.describe(`Edit Disallow Rendering`, async () => {
    test(`Not logged in`, async ({ navigationMenu, formPage }) => {
        const formName = 'Short Form 36-Item Health Survey (SF-36)';
        await navigationMenu.gotoFormByName(formName);
        await expect(formPage.disallowRenderingText()).toHaveText(message);
    });

    test.describe(`Logged in`, async () => {
        test(`Regular user cannot edit`, async ({ formPage, navigationMenu, saveModal }) => {
            const formName = 'Short Form 36-Item Health Survey (SF-36)';
            await navigationMenu.login(Accounts.regularUser);
            await navigationMenu.gotoFormByName(formName);
            await expect(formPage.disallowRenderingCheckbox()).toBeHidden();
        });

        test.describe(`Can edit`, async () => {
            test(`OrgAuthority user`, async ({ formPage, navigationMenu, saveModal }) => {
                const formName = 'Disallow render form';
                await navigationMenu.login(Accounts.orgAuthority);
                await navigationMenu.gotoFormByName(formName);
                await expect(formPage.disallowRenderingText()).toBeHidden();
                await formPage.disallowRenderingCheckbox().check();
                await saveModal.newVersion('Form saved.');
            });
            test(`NlmCurator user`, async ({ formPage, navigationMenu }) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await navigationMenu.login(Accounts.nlmCurator);
                await navigationMenu.gotoFormByName(formName);
                await expect(formPage.disallowRenderingText()).toHaveText(message);
                await expect(formPage.disallowRenderingCheckbox()).toBeEnabled();
            });
            test(`SiteAdmin user`, async ({ formPage, navigationMenu }) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await navigationMenu.login(Accounts.nlm);
                await navigationMenu.gotoFormByName(formName);
            });

            test.afterEach(async ({ formPage }) => {
                await expect(formPage.disallowRenderingText()).toHaveText(message);
                await expect(formPage.disallowRenderingCheckbox()).toBeVisible();
            });
        });
    });
});