import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Definition, Designation } from '../../../model/type';

test.describe(`Delete draft `, async () => {
    test(`CDE page`, async ({ page, navigationMenu, saveModal, generateDetailsSection }) => {
        const newDesignation: Designation = {
            designation: `draft designation`,
            sources: [],
            tags: ['Health'],
        };
        const newDefinition: Definition = {
            definition: `draft definition`,
            sources: [],
            tags: ['Health'],
        };
        const cdeName = 'Cde Delete Test';
        await navigationMenu.login(Accounts.cabigEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await generateDetailsSection.addName(newDesignation);
        await generateDetailsSection.addDefinition(newDefinition);

        await saveModal.deleteDraft();

        await expect(page.getByText(newDesignation.designation)).toBeHidden();
        await expect(page.getByText(newDefinition.definition)).toBeHidden();
    });

    test(`Form page`, async ({ page, navigationMenu, saveModal, generateDetailsSection }) => {
        const newDesignation: Designation = {
            designation: `draft designation`,
            sources: [],
            tags: ['Health'],
        };
        const newDefinition: Definition = {
            definition: `draft definition`,
            sources: [],
            tags: ['Health'],
        };
        const formName = 'Form Delete Test';
        await navigationMenu.login(Accounts.ctepEditor);
        await navigationMenu.gotoFormByName(formName);
        await generateDetailsSection.addName(newDesignation);
        await generateDetailsSection.addDefinition(newDefinition);

        await saveModal.deleteDraft();

        await expect(page.getByText(newDesignation.designation)).toBeHidden();
        await expect(page.getByText(newDefinition.definition)).toBeHidden();
    });
});
