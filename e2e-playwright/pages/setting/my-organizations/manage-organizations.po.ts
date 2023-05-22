import { Locator, Page } from '@playwright/test';

export class ManageOrganizationsPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page
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
        return this.page.getByTestId('add-organization-submit')
    }

    managedOrganizations(orgName) {
        return this.page.locator('[data-testid="managed-organization"]', {
            has: this.page.locator('[data-testid="organization-name"]', {
                has: this.page.getByText(orgName, {exact: true})
            })
        })
    }

    organizationName(locator: Locator) {
        return locator.getByTestId('organization-name')
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

}
