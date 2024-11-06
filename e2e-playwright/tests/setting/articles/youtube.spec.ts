import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`youtube videos`, async ({ page, materialPage, navigationMenu, articlePage }) => {
    const videoText = `<cde-youtube-video>tBHLNhX2nK8</cde-youtube-video>`;
    await navigationMenu.gotoVideos();
    await expect(page.getByText('404')).toBeHidden();
    await navigationMenu.login(Accounts.orgAuthority);
    await navigationMenu.gotoSettings();
    await navigationMenu.gotoArticle();

    await articlePage.articleKeySelection().click();
    await materialPage.matOptionByText('videos').click();
    await articlePage.editArticle(videoText, {
        replace: true,
        html: true,
    });
    await navigationMenu.gotoVideos();
    await expect(page.locator(`[src="https://www.youtube.com/embed/tBHLNhX2nK8?ref=0"]`)).toBeVisible();
});
