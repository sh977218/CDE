import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Copy`, async () => {
    test(`curatorCanCopy`, async ({ page, navigationMenu }) => {
        const cdeName = 'Brief Pain Inventory (BPI) - pain general activity interference scale';
        const formName = 'Frontal Systems Behavioral Scale (FrSBe)';
        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
    });

    test(`regUserCantCopy`, async ({ page, navigationMenu }) => {
        const cdeName = 'Ethnic Group Category Text';
        const formName = 'Patient Health Questionnaire-2 (PHQ-2) More Questions';
        await navigationMenu.login(Accounts.regularUser);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeHidden();
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeHidden();
    });
});
