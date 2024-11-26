import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Add Org working group classification`, async ({
    materialPage,
    saveModal,
    searchPage,
    createEltPage,
    navigationMenu,
    manageClassificationPage,
    generateDetailsSection,
    classificationSection,
}) => {
    const workingGroupOrg = 'Test Working Group 2';
    const classificationCategories = ['ABTC', 'ABTC 0904'];

    const cdeName = 'Test CDE for Test Working Group 2';
    const cdeDef = 'Let this test pass please!!!';
    const org = 'CTEP';

    const workingGroupOrgClassificationArray = [workingGroupOrg].concat(classificationCategories);
    const orgClassificationArray = [org].concat(classificationCategories);

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.ctepEditor);
    });

    await test.step(`add org working group classification`, async () => {
        await navigationMenu.gotoClassification();
        await materialPage.selectMatSelect(manageClassificationPage.organizationSelect(), workingGroupOrg);
        await manageClassificationPage.addOrgClassification(workingGroupOrgClassificationArray);
    });

    await test.step(`Create CDE under the main org by working group user`, async () => {
        await navigationMenu.gotoCreateCde();
        await createEltPage.createElt({
            eltName: cdeName,
            eltDef: cdeDef,
            eltOrg: org,
            eltClassificationCategories: orgClassificationArray,
        });
        await test.step(`Edit registration status to 'Qualified'`, async () => {
            await generateDetailsSection.editRegistrationStatus({ status: 'Qualified' });
        });

        await saveModal.publishNewVersionByType('cde');

        await test.step(`Classify cde with working group org`, async () => {
            await classificationSection.addClassification(workingGroupOrgClassificationArray);
        });

        await navigationMenu.gotoCdeSearch();
        await expect(searchPage.organizationTitleLink().filter({ hasText: workingGroupOrg })).toBeVisible();
    });

    await test.step(`site admin user 'NLM' should see the working group org`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeSearch();
        await expect(searchPage.organizationTitleLink().filter({ hasText: workingGroupOrg })).toBeVisible();
    });

    await test.step(`Other user should not see the working group org`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.classificationManageUser);
        await navigationMenu.gotoCdeSearch();
        await expect(searchPage.organizationTitleLink().filter({ hasText: workingGroupOrg })).toBeHidden();
    });
});
