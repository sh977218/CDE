import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`unpin`, async () => {
    test(`unpin cde from board`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
        const cdeName = 'Imaging volumetric result';

        await navigationMenu.login(Accounts.unpinUser);
        await navigationMenu.gotoMyBoard();
        await myBoardPage.boardTitle('Unpin Board').click();
        await expect(page.getByText(cdeName)).not.toHaveCount(0);

        await page.locator('id=unpin_0').click();
        await materialPage.checkAlert('Unpinned.');
        await expect(page.getByText(cdeName)).toHaveCount(0);
    });
});
