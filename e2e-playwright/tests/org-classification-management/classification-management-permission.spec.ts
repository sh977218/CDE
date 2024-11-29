import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Classification Management Permission`, async () => {
    test(`'Org Edit' not 'Org Admin' can only see classification`, async ({
        page,

        navigationMenu,
        manageClassificationPage,
        materialPage,
    }) => {
        const org = 'CTEP';

        await navigationMenu.login(Accounts.ctepOnlyEditor);
        await navigationMenu.gotoClassification();
        await materialPage.selectMatSelect(manageClassificationPage.organizationSelect(), org);
        await materialPage.expandClassificationAndReturnLeafNode(['CTEP']);
        await expect(page.getByText('CRF_TTU')).toBeVisible();
        await expect(materialPage.matArrayLeft()).toBeHidden();
        await expect(materialPage.matEdit()).toBeHidden();
        await expect(materialPage.matDelete()).toBeHidden();
        await expect(materialPage.matTransform()).toBeHidden();

        await test.step(`classification link`, async () => {
            const [, newPage] = await Promise.all([
                page.getByRole('link', { name: 'CRF_TTU' }).click(),
                page.waitForEvent('popup'),
            ]);
            await expect(newPage).toHaveURL(/search\?selectedOrg=CTEP&classification=CRF_TTU/);
        });
    });
});
