import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';

test.describe(`Pin to board`, async () => {
    test(`Not logged in`, async ({ basePage, searchPage, cdePage, page }) => {
        const loggedOutMessage = [
            'Create Boards and save CDEs and Forms to them',
            'Remember your preferences on all your devices',
            "If approved, become a curator, and view/manage your organization's contents",
        ];
        await searchPage.goToSearch('cde');
        await searchPage.browseOrganization('NINDS');
        await searchPage.pinAll().click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);

        await searchPage.pinBoardModalButton().click();

        await expect(page.getByTestId(`open-login-page`)).toBeVisible();
        await page.goBack();

        await searchPage.pinElement(0).click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);

        await searchPage.pinBoardModalClose().click();
        await searchPage.goToElt(0).click();
        await cdePage.addToBoard().click();
        await expect(searchPage.pinBoardModalMessage()).toHaveText(loggedOutMessage);
        await searchPage.pinBoardModalClose().click();
    });
});
