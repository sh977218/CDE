import { Page } from '@playwright/test';
import { MaterialPo } from '../../pages/shared/material.po';
import { TableViewSetting } from '../../model/type';
import { isBoolean } from 'lodash';

export class CustomizeTableModalPo {
    protected page: Page;
    protected materialPage: MaterialPo;

    constructor(page: Page, materialPage: MaterialPo) {
        this.page = page;
        this.materialPage = materialPage;
    }

    async loadDefaultTableViewSettings() {
        await this.page.locator('#list_gridView').click();
        await this.page.locator('#tableViewSettings').click();
        await this.materialPage.matDialog().waitFor();
        await this.page.locator('#loadDefaultTableViewSettingsBtn').click();
        await this.materialPage.checkAlert('Default settings loaded. Click Close to save your settings.');
        await this.page.locator('#closeTableViewSettingsBtn').click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }

    async loadTableViewSettings(tableViewSetting: TableViewSetting) {
        const matDialog = this.materialPage.matDialog();
        if (tableViewSetting.otherName) {
            await matDialog.getByRole('checkbox', { name: 'Other Names' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Other Names' }).uncheck();
        }
        if (tableViewSetting.usedBy) {
            await matDialog.getByRole('checkbox', { name: 'Used By' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Used By' }).uncheck();
        }
        if (tableViewSetting.updated) {
            await matDialog.getByRole('checkbox', { name: 'Updated' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Updated' }).uncheck();
        }
        if (tableViewSetting.permissibleValues) {
            await matDialog.getByRole('checkbox', { name: 'Permissible Values', exact: true }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Permissible Values', exact: true }).uncheck();
        }
        if (tableViewSetting.numberOfPermissibleValues) {
            await matDialog.getByRole('checkbox', { name: 'Number Of Permissible Values' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Number Of Permissible Values' }).uncheck();
        }
        if (tableViewSetting.unitOfMeasure) {
            await matDialog.getByRole('checkbox', { name: 'Unit Of Measure' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Unit Of Measure' }).uncheck();
        }
        if (tableViewSetting.source) {
            await matDialog.getByRole('checkbox', { name: 'Source' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Source' }).uncheck();
        }
        if (tableViewSetting.nlmId) {
            await matDialog.getByRole('checkbox', { name: 'NLM Id' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'NLM Id' }).uncheck();
        }
        if (tableViewSetting.steward) {
            await matDialog.getByRole('checkbox', { name: 'Steward' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Steward' }).uncheck();
        }
        if (tableViewSetting.linkedForms) {
            await matDialog.getByRole('checkbox', { name: 'Linked Forms' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Linked Forms' }).uncheck();
        }
        if (tableViewSetting.registrationStatus) {
            await matDialog.getByRole('checkbox', { name: 'Registration Status' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Registration Status' }).uncheck();
        }
        if (tableViewSetting.adminStatus) {
            await matDialog.getByRole('checkbox', { name: 'Admin Status' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Admin Status' }).uncheck();
        }
        if (tableViewSetting.questionTexts) {
            await matDialog.getByRole('checkbox', { name: 'Question Texts' }).check();
        } else {
            await matDialog.getByRole('checkbox', { name: 'Question Texts' }).uncheck();
        }
        if (tableViewSetting.identifiers) {
            await matDialog.getByRole('checkbox', { name: 'Identifiers' }).check();
            for (const identifier of tableViewSetting.identifiers) {
                await this.page.locator(`//*[@id='identifiers']//input`).click();
                await this.materialPage.matDialog().locator(`#identifiers`).click();
                await this.materialPage.matOptionByText(identifier).click();
            }
        } else {
            await matDialog.getByRole('checkbox', { name: 'Identifiers' }).uncheck();
        }
    }

    async loadTableViewSettingsForExport() {
        await this.page.locator('#list_gridView').click();
        const waitForIdSourceApiPromise = this.page.waitForResponse('/server/system/idSources');
        await this.page.locator('#tableViewSettings').click();
        await this.materialPage.matDialog().waitFor();
        await waitForIdSourceApiPromise;
        await this.loadTableViewSettings({
            otherName: true,
            updated: true,
            unitOfMeasure: true,
            source: true,
            adminStatus: true,
            identifiers: ['NINDS Variable Name'],
        });
        await this.page.locator('#closeTableViewSettingsBtn').click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }
}
