import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe('Role permission', async () => {
    test(`Org admin cannot edit Preferred Standard CDE`, async ({
        page,
        navigationMenu,
        cdePage,
        generateDetailsSection,
    }) => {
        const cdeName =
            'Pattern Transfer Retrieval Storage Data Research Activity Consortium or Network Or Professional Organization or Group Funding Mechanism FundingMechanismCode';
        await navigationMenu.login(Accounts.cabigEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(cdePage.alerts()).toContainText('You may not edit this CDE because it is standard.');

        // all edit icons should be hidden
        await expect(page.getByRole('img', { name: 'edit' })).toBeHidden();
        // all delete icon buttons should be hidden
        await expect(page.getByRole('button', { name: 'Remove' })).toBeHidden();

        await expect(page.getByRole('button', { name: 'Add Name' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Definition' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Concept' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Property' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Upload more files' })).toBeHidden();
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeHidden();

        // can classify
        await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeEnabled();
    });

    test(`Org admin cannot edit Standard CDE`, async ({ page, navigationMenu, cdePage, generateDetailsSection }) => {
        const cdeName = 'Patient Visual Change Chief Complaint Indicator';
        await navigationMenu.login(Accounts.cabigEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(cdePage.alerts()).toContainText('You may not edit this CDE because it is standard.');

        // all edit icons should be hidden
        await expect(page.getByRole('img', { name: 'edit' })).toBeHidden();
        // all delete icon buttons should be hidden
        await expect(page.getByRole('button', { name: 'Remove' })).toBeHidden();

        await expect(page.getByRole('button', { name: 'Add Name' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Definition' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Concept' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Property' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Upload more files' })).toBeHidden();
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeHidden();

        // can classify
        await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeEnabled();
    });

    test(`Org admin can edit their own CDE`, async ({ page, navigationMenu, generateDetailsSection }) => {
        const cdeName = 'Communication Contact Email Address java.lang.String';
        await navigationMenu.login(Accounts.cabigEditor);
        await navigationMenu.gotoCdeByName(cdeName);

        await expect(page.getByTestId('inline-edit-icon')).not.toHaveCount(0);

        await expect(page.getByRole('button', { name: 'Add Name' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Add Definition' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Add Concept' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Add Property' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Upload more files' })).toBeEnabled();
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeEnabled();

        // can classify
        await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeEnabled();
    });

    test(`Logged out cannot edit`, async ({ page, navigationMenu, generateDetailsSection }) => {
        const cdeName = 'ALS Depression Inventory-12 (ADI-12) - lost abandoned scale';
        await navigationMenu.gotoCdeByName(cdeName);

        // all edit icons should be hidden
        await expect(page.getByRole('img', { name: 'edit' })).toBeHidden();
        // all delete icon buttons should be hidden
        await expect(page.getByRole('button', { name: 'Remove' })).toBeHidden();

        await expect(page.getByRole('button', { name: 'Add Name' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Definition' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Concept' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Property' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Upload more files' })).toBeHidden();
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeHidden();
        await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeHidden();
    });

    test(`governanceUser cannot edit CDE`, async ({
        page,
        navigationMenu,
        settingMenu,
        searchSettingPage,
        generateDetailsSection,
    }) => {
        await test.step(`Login and set view draft`, async () => {
            await navigationMenu.login(Accounts.governanceUser);
            await navigationMenu.gotoSettings();
            await settingMenu.searchSettingsMenu().click();
            await searchSettingPage.setViewPublishAndDraft();
        });

        await test.step(`Cannot edit CDE`, async () => {
            const cdeName = 'DCE-MRI Kinetics T1 Mapping Quality Type';
            await navigationMenu.gotoCdeByName(cdeName);

            // all edit icons should be hidden
            await expect(page.getByRole('img', { name: 'edit' })).toBeHidden();
            // all delete icon buttons should be hidden
            await expect(page.getByRole('button', { name: 'Remove' })).toBeHidden();

            await expect(page.getByRole('button', { name: 'Add Name' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Definition' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Concept' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Property' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Upload more files' })).toBeHidden();
            await expect(generateDetailsSection.editRegistrationStatusButton()).toBeHidden();
            await expect(page.getByRole('button', { name: 'Classify this CDE' })).toBeHidden();
        });
        await test.step(`Cannot edit Form`, async () => {
            const formName = 'ALS Score Form';
            await navigationMenu.gotoFormByName(formName);

            // all edit icons should be hidden
            await expect(page.getByRole('img', { name: 'edit' })).toBeHidden();
            // all delete icon buttons should be hidden
            await expect(page.getByRole('button', { name: 'Remove' })).toBeHidden();

            await expect(page.getByRole('button', { name: 'Add Name' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Definition' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Concept' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Identifier' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Property' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Add Related Document' })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Upload more files' })).toBeHidden();
            await expect(generateDetailsSection.editRegistrationStatusButton()).toBeHidden();
            await expect(page.getByRole('button', { name: 'Classify this Form' })).toBeHidden();
        });
    });

    test(`Org authority can edit Standard CDE's status`, async ({ navigationMenu, generateDetailsSection }) => {
        const cdeName = 'Patient Visual Change Chief Complaint Indicator';
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeEnabled();
    });

    test(`Logged out cannot see draft`, async ({ page, navigationMenu }) => {
        const cdeName = 'Draft Cde Test';
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByText('Delete Draft')).toHaveCount(0);
    });
});
