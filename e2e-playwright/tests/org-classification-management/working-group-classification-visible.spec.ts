import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Working group classification visible`, async ({
    page,
    saveModal,
    navigationMenu,
    generateDetailsSection,
    classificationSection,
}) => {
    const workingGroupOrg = 'WG-TEST';
    const classificationCategories = ['WG Classif', 'WG Sub / Classif'];

    const cdeName = 'Specimen Block Received Count';
    const workingGroupOrgClassificationArray = [workingGroupOrg].concat(classificationCategories);

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.workingGroupUser);
    });

    await test.step(`Go to CDE and classify with working group classification, which contains special character '/'`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await classificationSection.addClassification(workingGroupOrgClassificationArray);
    });

    await test.step(`Log out and working group classification is not visible`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByText(workingGroupOrg)).toBeHidden();
        await expect(page.getByText(classificationCategories[0])).toBeHidden();
        await expect(page.getByText(classificationCategories[1])).toBeHidden();
    });
});
