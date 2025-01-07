import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`history collapse expand`, async ({ navigationMenu, historySection }) => {
    const cdeName = 'cde for test cde reorder detail tabs';

    await navigationMenu.gotoCdeByName(cdeName, true);

    await expect(historySection.historyTableRows()).toHaveCount(4);

    await test.step(`expand history table`, async () => {
        await historySection.expandListLink().click();
        await expect(historySection.historyTableRows()).toHaveCount(11);
    });
    await test.step(`collapse history table`, async () => {
        await historySection.collapseListLink().click();
        await expect(historySection.historyTableRows()).toHaveCount(4);
    });
});
