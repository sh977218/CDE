import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Form general detail information`, async () => {
    const formName = 'Section Inside Section Form';

    test.beforeEach(async ({ navigationMenu }) => {
        await navigationMenu.gotoFormByName(formName);
    });

    test(`Logged in`, async ({ navigationMenu, generateDetailsSection, inlineEdit }) => {
        await navigationMenu.login(Accounts.nlm);
        await expect(generateDetailsSection.createdLabel()).toHaveText(`Created:`);
        await expect(generateDetailsSection.created()).toHaveText(`05/09/2016 @ 5:21PM`);
        await expect(generateDetailsSection.createdByLabel()).toHaveText(`Created By:`);
        await expect(generateDetailsSection.createdBy()).toHaveText(`testAdmin`);
        await expect(generateDetailsSection.updatedLabel()).toHaveText(`Updated:`);
        await expect(generateDetailsSection.updated()).toHaveText(`05/11/2016 @ 11:11AM`);
        await expect(generateDetailsSection.updatedByLabel()).toHaveText(`Updated By:`);
        await expect(generateDetailsSection.updatedBy()).toHaveText(`testAdmin`);
    });

    test(`Logged out`, async ({ generateDetailsSection }) => {
        await expect(generateDetailsSection.createdLabel()).toHaveText(`Created:`);
        await expect(generateDetailsSection.created()).toHaveText(`05/09/2016 @ 5:21PM`);
        await expect(generateDetailsSection.createdByLabel()).toBeHidden();
        await expect(generateDetailsSection.createdBy()).toBeHidden();
        await expect(generateDetailsSection.updatedLabel()).toHaveText(`Updated:`);
        await expect(generateDetailsSection.updated()).toHaveText(`05/11/2016 @ 11:11AM`);
        await expect(generateDetailsSection.updatedByLabel()).toBeHidden();
        await expect(generateDetailsSection.updatedBy()).toBeHidden();
    });
});
