import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

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

    test(`Org authority can edit Standard CDE's status`, async ({ navigationMenu, generateDetailsSection }) => {
        const cdeName = 'Patient Visual Change Chief Complaint Indicator';
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(generateDetailsSection.editRegistrationStatusButton()).toBeEnabled();
    });
});
