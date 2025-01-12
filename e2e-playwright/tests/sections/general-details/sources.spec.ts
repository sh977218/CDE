import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe(`Sources`, async () => {
    test(`Form`, async ({ formPage, navigationMenu, generateDetailsSection }) => {
        const formName = 'Traumatic Brain Injury - Adverse Events';
        await navigationMenu.gotoFormByName(formName);
        await expect(generateDetailsSection.sources()).toContainText('Name:caBIG');
        await expect(generateDetailsSection.sources()).toContainText('Created:12/10/2004');
        await expect(generateDetailsSection.sources()).toContainText('Updated:10/17/2006');
        await expect(generateDetailsSection.sources()).toContainText('Registration Status:standard');
        await expect(generateDetailsSection.sources()).toContainText('Datatype:Number');
    });
});
