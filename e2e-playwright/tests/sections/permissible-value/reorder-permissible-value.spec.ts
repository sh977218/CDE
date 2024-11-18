import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { move } from '../../../pages/util';

test.describe(`reorder permissible value`, async () => {
    test(`CDE`, async ({ page, permissibleValueSection, navigationMenu }) => {
        const cdeName = 'Reorder permissible values cde';
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoCdeByName(cdeName, true);

        const cdePVsLocator = page.getByTestId('pvTable').getByTestId('pvValue').locator('cde-inline-view');
        const cdePVs = await cdePVsLocator.allInnerTexts();

        await permissibleValueSection.reorderPV(0, 'down');
        move(cdePVs, 0, 1);
        await expect(cdePVsLocator).toHaveText(cdePVs);

        await permissibleValueSection.reorderPV(2, 'up');
        move(cdePVs, 2, 1);
        await expect(cdePVsLocator).toHaveText(cdePVs);

        await permissibleValueSection.reorderPV(1, 'top');
        move(cdePVs, 1, 0);
        await expect(cdePVsLocator).toHaveText(cdePVs);
    });
});
