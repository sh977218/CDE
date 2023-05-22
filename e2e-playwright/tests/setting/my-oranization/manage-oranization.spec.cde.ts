import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import { expect } from '@playwright/test';

const newOrganization = {
    orgName: 'MLB ' + new Date(),
    orgLongName: 'Medical Language Branch',
    orgMailAddress: '9000 Rockville Pike, Bethesda, Maryland 20982 USA',
    orgEmailAddress: 'mlb@mln.mlb',
    orgPhoneNumber: '301-594-1247',
    orgUri: 'www.nih.gov',
    orgWorkingGroup: 'NLM',
    orgExtraInfo: 'For medical research'
}

test.describe(`My organization`, async () => {
    test(`Rename organization`, async ({
                                                  basePage,
                                                  snackBar,
                                                  inlineEdit,
                                                  settingMenu,
                                                  navigationMenu,
                                                  manageOrganizationsPage
                                              }) => {
        await basePage.goToHome();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await navigationMenu.gotoSettings();
        await settingMenu.manageOrganizationsMenu().click();
        await manageOrganizationsPage.newOrganizationName().fill(newOrganization.orgName);
        await manageOrganizationsPage.newOrganizationLongName().fill(newOrganization.orgLongName);
        await manageOrganizationsPage.newOrganizationWorkingGroup().selectOption(newOrganization.orgWorkingGroup);
        await manageOrganizationsPage.newOrganizationSubmit().click();
        await snackBar.checkAlert('Saved');
        await snackBar.dismissAlert();

        const managedOrganizationsLocator = manageOrganizationsPage.managedOrganizations(newOrganization.orgName);

        const organizationNameLocator = manageOrganizationsPage.organizationName(managedOrganizationsLocator);
        await expect(organizationNameLocator).toBeVisible();
        const organizationLongNameLocator = manageOrganizationsPage.organizationLongName(managedOrganizationsLocator);
        await expect(organizationLongNameLocator).toBeVisible();
        const organizationWorkingGroupLocator = manageOrganizationsPage.organizationWorkingGroup(managedOrganizationsLocator);
        await expect(organizationWorkingGroupLocator).toBeVisible();

        const organizationMailAddressLocator = manageOrganizationsPage.organizationMailAddress(managedOrganizationsLocator);
        await inlineEdit.editIcon(organizationMailAddressLocator).click();
        await inlineEdit.inputField(organizationMailAddressLocator).fill(newOrganization.orgMailAddress);
        await inlineEdit.submitButton(organizationMailAddressLocator).click();
        await snackBar.checkAlert('Saved');
        await snackBar.dismissAlert();
        await expect(manageOrganizationsPage.organizationMailAddress(managedOrganizationsLocator)).toBeVisible();

    })

});
