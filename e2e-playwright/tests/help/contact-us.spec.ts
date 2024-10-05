import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`Contact us`, async ({ page, navigationMenu }) => {
    const newPage = await navigationMenu.gotoContactUs();
    await expect(newPage).toHaveTitle('NLM Support Center · NLM Customer Support Center');
});
