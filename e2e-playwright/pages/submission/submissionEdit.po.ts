import { expect, Locator, Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';
import { button, tag } from '../util';

export class SubmissionEditPo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    isEdit() {
        expect(this.page.url().includes('?_id=')).toBeTruthy();
    }

    async isNameAndVersion(name: string, version: string) {
        await expect(this.page.getByPlaceholder('Ex. Topic Collection 1')).toHaveValue(name);
        await expect(this.page.getByPlaceholder('Ex. 1.A')).toHaveValue(version);
    }

    isNew() {
        expect(this.page.url().endsWith('/collection/edit')).toBeTruthy();
    }

    isView() {
        expect(this.page.url().endsWith('/collection')).toBeTruthy();
    }
}

export async function checkSubmissionValidationReport(page: Page | Locator, materialPo: MaterialPo) {
    await button(page, 'Download Report').click();
    await materialPo.checkAlert('Report saved. Check downloaded files.');

    await expect(tag(page, 'h1', 'Summary of Errors')).toBeVisible();
    await expect(tag(page, 'h2', 'Critical Errors')).toBeVisible();
    await expect(tag(page, 'li', 'Length of Lists: 14')).toBeVisible();
    await expect(tag(page, 'li', 'Required Field: 1')).toBeVisible();
    await expect(tag(page, 'h1', 'Critical Errors:')).toBeVisible();
    await expect(tag(page, 'h2', 'Length of Lists')).toBeVisible();
    await expect(
        tag(page, 'li', 'There are 7 PV Labels but 8 PV Definitions. Must be the same count. Row(s) 12')
    ).toBeVisible();
    await expect(tag(page, 'h2', 'Required Fields')).toBeVisible();
    await expect(
        tag(
            page,
            'li',
            'CDE Data Type must be one of the following: Value List, Text, Number, Date, Time, Datetime, Geolocation, File/URI/URL. Row(s) 5'
        )
    ).toBeVisible();
}
