import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Verify form preview dynamic code list`, async ({ page, navigationMenu }) => {
    const formName = 'Dynamic Code List Form';
    const foundCodeNameLongList = 'HIV 2 gp125';
    const foundCodeNameShortList = 'Whole Blood into Peripheral Vein, Percutaneous Approach';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Verify data list`, async () => {
        await page.waitForLoadState('networkidle');
        const codeNameLongListInnerHtml = await page.locator(`//*[@id='Long Dynamic Code List_0-0']`).innerHTML();
        expect(codeNameLongListInnerHtml).toContain(foundCodeNameLongList);

        const codeNameShortListInnerHtml = await page.locator(`//*[@id='Short Dynamic Code List_0-1']`).innerHTML();
        expect(codeNameShortListInnerHtml).toContain(foundCodeNameShortList);
    });
});
