import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Edit resource`, async ({ page, materialPage, navigationMenu, attachmentSection, articlePage }) => {
    const resourceText =
        'The NIH CDE Repository is consolidating CDE Resources here on the NIH CDE Repository website\n';
    const rssTextWithUrl = `<p><rss-feed>https://www.nibib.nih.gov/rss</rss-feed></p>\n`;
    const rssTextWithWrongFormat = `<p><rs-feed></rs-feed"</p>`;
    await navigationMenu.login(Accounts.nlm);

    await navigationMenu.gotoSettings();
    await navigationMenu.gotoArticle();

    await articlePage.articleKeySelection().click();
    await materialPage.matOptionByText('resources').click();

    await page.waitForTimeout(2000); // wait for ckeditor <script> to resolve.
    await attachmentSection.uploadAttachment(`./e2e-playwright/assets/painLocationInapr.png`);

    await articlePage.editArticle(resourceText + rssTextWithUrl + rssTextWithWrongFormat, {
        replace: true,
        html: true,
    });

    await expect(page.getByText(resourceText)).toBeVisible();

    await navigationMenu.gotoResources();
    await expect(page.getByText(resourceText)).toBeVisible();
    expect(await page.getByText(`Search results for:`).count()).toBeGreaterThan(0);
    expect(await page.getByText(`RSS Feeds`).count()).toBeGreaterThan(0);
});
