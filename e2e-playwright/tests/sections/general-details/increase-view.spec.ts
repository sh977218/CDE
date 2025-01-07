import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`increase view count`, async ({ navigationMenu, generateDetailsSection }) => {
    const cdeName = 'Tissue Donor Genetic Testing Other Disease or Disorder Specify';
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoCdeByName(cdeName);
    const viewCountBefore = await generateDetailsSection.viewCount().innerText();
    for (let i = 0; i < 9; i++) {
        await navigationMenu.gotoCdeByName(cdeName);
    }

    const viewCountAfter = Number.parseInt(viewCountBefore) + 9;
    await expect(generateDetailsSection.viewCount()).toHaveText(viewCountAfter + '');
});
