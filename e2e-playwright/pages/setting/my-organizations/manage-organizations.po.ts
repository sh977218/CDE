import { Locator, Page } from '@playwright/test';
import { MaterialPo } from '../../../pages/shared/material.po';
import { Organization } from '../../../model/type';
import { InlineEditPo } from '../../../pages/shared/inline-edit.po';

export class ManageOrganizationsPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;

    constructor(page: Page, materialPage: MaterialPo, inlineEdit: InlineEditPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
    }

    newOrganizationName() {
        return this.page.getByTestId('new-organization-name');
    }

    newOrganizationLongName() {
        return this.page.getByTestId('new-organization-long-name');
    }

    newOrganizationWorkingGroup() {
        return this.page.getByTestId('new-organization-working-group');
    }

    newOrganizationSubmit() {
        return this.page.getByTestId('add-organization-submit');
    }

    managedOrganizations(orgName: string) {
        return this.page.locator('[data-testid="managed-organization"]', {
            has: this.page.locator('[data-testid="organization-name"]', {
                has: this.page.getByText(orgName, { exact: true }),
            }),
        });
    }

    organizationName(locator: Locator) {
        return locator.getByTestId('organization-name');
    }

    organizationLongName(locator: Locator) {
        return locator.getByTestId('organization-long-name');
    }

    organizationMailAddress(locator: Locator) {
        return locator.getByTestId('organization-mail-address');
    }

    organizationEmailAddress(locator: Locator) {
        return locator.getByTestId('organization-email-address');
    }

    organizationPhoneNumber(locator: Locator) {
        return locator.getByTestId('organization-phone-number');
    }

    organizationUri(locator: Locator) {
        return locator.getByTestId('organization-uri');
    }

    organizationExtraInfo(locator: Locator) {
        return locator.getByTestId('organization-extra-info');
    }

    organizationWorkingGroup(locator: Locator) {
        return locator.getByTestId('organization-working-group');
    }

    async addNewOrg(newOrganization: Organization) {
        await this.newOrganizationName().fill(newOrganization.orgName);
        if (newOrganization.orgLongName) {
            await this.newOrganizationLongName().fill(newOrganization.orgLongName);
        }
        if (newOrganization.orgWorkingGroup) {
            await this.newOrganizationWorkingGroup().selectOption(newOrganization.orgWorkingGroup);
        }
        await this.newOrganizationSubmit().click();
        await this.materialPage.checkAlert('Saved');
    }

    async editOrg(organization: Organization) {
        const managedOrganizationsLocator = this.managedOrganizations(organization.orgName);
        if (organization.orgMailAddress) {
            const organizationMailAddressLocator = this.organizationMailAddress(managedOrganizationsLocator);
            await this.inlineEdit.editIcon(organizationMailAddressLocator).click();
            await this.inlineEdit.inputField(organizationMailAddressLocator).fill(organization.orgMailAddress);
            await this.inlineEdit.confirmButton(organizationMailAddressLocator).click();
            await this.materialPage.checkAlert('Saved');
        }
        if (organization.orgExtraInfo) {
            const organizationExtraInfoLocator = this.organizationExtraInfo(managedOrganizationsLocator);
            await this.inlineEdit.editIcon(organizationExtraInfoLocator).click();
            await this.inlineEdit.inputField(organizationExtraInfoLocator).fill(organization.orgExtraInfo);
            await this.inlineEdit.confirmButton(organizationExtraInfoLocator).click();
            await this.materialPage.checkAlert('Saved');
        }
    }
}
