import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Banner`, async () => {
    test(`Shutdown banner`, async ({ page, navigationMenu, materialPage, articlePage }) => {
        await test.step(`'Shutdown banner' not there`, async () => {
            await expect(navigationMenu.shutdownBanner()).toBeHidden();
        });

        await test.step(`Toggle on 'Shutdown banner'`, async () => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoSettings();
            await navigationMenu.gotoArticle();
            await articlePage.articleKeySelection().click();
            await materialPage.matOptionByText('shutdownBanner').click();
            await articlePage.shutdownToggle().click();
            await materialPage.checkAlert('Saved');
        });

        await test.step(`'Shutdown banner' is there`, async () => {
            await page.reload();
            await expect(navigationMenu.shutdownBanner()).toBeVisible();
            await navigationMenu.shutdownBannerCloseButton().click();
            await expect(navigationMenu.shutdownBanner()).toBeHidden();
        });

        await test.step(`Toggle off 'Shutdown banner'`, async () => {
            await navigationMenu.gotoSettings();
            await navigationMenu.gotoArticle();
            await articlePage.articleKeySelection().click();
            await materialPage.matOptionByText('shutdownBanner').click();
            await articlePage.shutdownToggle().click();
            await materialPage.checkAlert('Saved');
        });

        await test.step(`'Shutdown banner' not there`, async () => {
            await page.reload();
            await expect(navigationMenu.shutdownBanner()).toBeHidden();
        });
    });
});
