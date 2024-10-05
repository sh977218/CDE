import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test(`Edit whats new`, async ({ page, materialPage, navigationMenu, attachmentSection, articlePage }) => {
    const whatsNewText = `
<h3>January 1st, 2022</h3>
<ul>
<li>NLM has created a new Common Data Elements tutorial titled <a href="https://www.nlm.nih.gov/oet/ed/cde/tutorial/index.html">Common Data Elements: Standardizing Data Collection</a>.&nbsp;</li>
</ul>
<h3>June 1st, 2021</h3>
<ul>
<li>Added an &quot;About&quot; page with general NIH Common Data Elements Repository information</li>
<li>Updated usability of &quot;My Boards&quot;</li>
<li>Updated &quot;Help&quot; menu to increase functionality</li>
<li>Updated &ldquo;Contact Us&rdquo; page</li>
</ul>
`;
    await navigationMenu.login(Accounts.nlm);

    await navigationMenu.gotoSettings();
    await navigationMenu.gotoArticle();

    await articlePage.articleKeySelection().click();
    await materialPage.matOptionByText('whatsNew').click();

    await page.waitForTimeout(2000); // wait for ckeditor <script> to resolve.
    await attachmentSection.uploadAttachment(`./e2e-playwright/assets/painLocationInapr.png`);

    await articlePage.editArticle(whatsNewText, {
        replace: true,
        html: true,
    });

    await expect(page.getByText('January 1st, 2022')).toBeVisible();

    await navigationMenu.gotoNewFeatures();
    await expect(page.getByText('January 1st, 2022')).toBeVisible();
});
