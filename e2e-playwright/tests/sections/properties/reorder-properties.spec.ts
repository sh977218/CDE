import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { move } from '../../../pages/util';

test.describe(`reorder properties`, async () => {
    test(`CDE`, async ({ page, propertySection, navigationMenu }) => {
        const cdeName = 'Reorder properties cde';
        await navigationMenu.gotoCdeByName(cdeName, true);
        await navigationMenu.login(Accounts.testEditor);

        const cdePropertiesLocator = page.locator('id=properties-div').locator('dl dt span');
        const cdeProperties = await cdePropertiesLocator.allInnerTexts();

        await propertySection.reorderProperty(0, 'down');
        move(cdeProperties, 0, 1);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);

        await propertySection.reorderProperty(2, 'up');
        move(cdeProperties, 2, 1);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);

        await propertySection.reorderProperty(2, 'top');
        move(cdeProperties, 2, 0);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);
    });

    test(`Form`, async ({ page, propertySection, navigationMenu }) => {
        const formName = 'form for test cde reorder detail tabs';
        await navigationMenu.gotoFormByName(formName, true);
        await navigationMenu.login(Accounts.testEditor);

        const cdePropertiesLocator = page.locator('id=properties-div').locator('dl dt span');
        const cdeProperties = await cdePropertiesLocator.allInnerTexts();

        await propertySection.reorderProperty(0, 'down');
        move(cdeProperties, 0, 1);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);

        await propertySection.reorderProperty(2, 'up');
        move(cdeProperties, 2, 1);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);

        await propertySection.reorderProperty(2, 'top');
        move(cdeProperties, 2, 0);
        await expect(cdePropertiesLocator).toHaveText(cdeProperties);
    });
});
