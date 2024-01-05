import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Classification Management`, async () => {
    test(`'Org Edit' not 'Org Admin' can only see classification`, async ({
        page,
        homePage,
        navigationMenu,
        manageClassificationPage,
        materialPage,
    }) => {
        const org = 'CTEP';
        await homePage.goToHome();
        await navigationMenu.login(user.ctepOnlyEditor.username, user.ctepOnlyEditor.password);
        await navigationMenu.gotoClassification();
        await manageClassificationPage.selectOrganization(org);
        await manageClassificationPage.expandClassificationAndReturnLeafNode(['CTEP']);
        await expect(page.getByText('CRF_TTU')).toBeVisible();
        await expect(materialPage.matArrayLeft()).toBeHidden();
        await expect(materialPage.matEdit()).toBeHidden();
        await expect(materialPage.matDelete()).toBeHidden();
        await expect(materialPage.matTransform()).toBeHidden();
    });
});
