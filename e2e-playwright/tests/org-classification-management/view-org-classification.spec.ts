import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`See different org classification`, async () => {
    test.beforeEach(async ({ navigationMenu }) => {
        await navigationMenu.login(Accounts.classificationManageUser);
    });
    test(`see org1`, async ({
        page,
        materialPage,
        manageClassificationPage,
        navigationMenu,
        classificationSection,
    }) => {
        const orgName = 'PS&CC';
        const classificationArray = ['CESD'];
        await navigationMenu.gotoClassification();
        await materialPage.selectMatSelect(manageClassificationPage.organizationSelect(), orgName);

        await materialPage.expandClassificationAndReturnLeafNode([orgName, ...classificationArray]);
        await expect(page.getByText('edu.fccc.brcf.domain')).toBeVisible();
        await expect(page.getByText('Magnetic Resonance Imaging (MRI)')).toBeHidden();
    });

    test(`see org2`, async ({
        page,
        materialPage,
        manageClassificationPage,
        navigationMenu,
        classificationSection,
    }) => {
        const orgName = 'ACRIN';
        const classificationArray = ['Imaging Modality'];
        await navigationMenu.gotoClassification();
        await materialPage.selectMatSelect(manageClassificationPage.organizationSelect(), orgName);

        await materialPage.expandClassificationAndReturnLeafNode([orgName, ...classificationArray]);
        await expect(page.getByText('edu.fccc.brcf.domain')).toBeHidden();
        await expect(page.getByText('Magnetic Resonance Imaging (MRI)')).toBeVisible();
    });
});
