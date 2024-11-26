import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const message =
    'info We do not have permission to display this form due to copyright/licensing restrictions. For more information, see the Copyright section below.';

test.describe(`Edit Disallow Rendering`, async () => {
    test(`Not logged in`, async ({ navigationMenu, generateDetailsSection }) => {
        const formName = 'Short Form 36-Item Health Survey (SF-36)';
        await navigationMenu.gotoFormByName(formName);
        await expect(generateDetailsSection.disallowRenderingText()).toHaveText(message);
    });

    test.describe(`Logged in`, async () => {
        test(`Regular user cannot edit`, async ({ generateDetailsSection, navigationMenu, saveModal }) => {
            const formName = 'Short Form 36-Item Health Survey (SF-36)';
            await navigationMenu.login(Accounts.regularUser);
            await navigationMenu.gotoFormByName(formName);
            await expect(generateDetailsSection.disallowRenderingCheckbox()).toBeHidden();
        });

        test.describe(`Can edit`, async () => {
            test(`OrgAuthority user`, async ({ generateDetailsSection, navigationMenu, saveModal }) => {
                const formName = 'Disallow render form';
                await navigationMenu.login(Accounts.orgAuthority);
                await navigationMenu.gotoFormByName(formName);
                await expect(generateDetailsSection.disallowRenderingText()).toBeHidden();
                await generateDetailsSection.disallowRenderingCheckbox().check();
                await saveModal.publishNewVersionByType('form');
            });
            test(`NlmCurator user`, async ({ generateDetailsSection, navigationMenu }) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await navigationMenu.login(Accounts.nlmCurator);
                await navigationMenu.gotoFormByName(formName);
                await expect(generateDetailsSection.disallowRenderingText()).toHaveText(message);
                await expect(generateDetailsSection.disallowRenderingCheckbox()).toBeEnabled();
            });
            test(`SiteAdmin user`, async ({ formPage, navigationMenu }) => {
                const formName = 'Short Form 36-Item Health Survey (SF-36)';
                await navigationMenu.login(Accounts.nlm);
                await navigationMenu.gotoFormByName(formName);
            });

            test.afterEach(async ({ generateDetailsSection }) => {
                await expect(generateDetailsSection.disallowRenderingText()).toHaveText(message);
                await expect(generateDetailsSection.disallowRenderingCheckbox()).toBeVisible();
            });
        });
    });
});
