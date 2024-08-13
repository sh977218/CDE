import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test(`Verify form preview date data type`, async ({ page, navigationMenu, previewSection }) => {
    const formName = 'DateTypeTest';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Verify preview input type`, async () => {
        await expect(page.locator(`//div[@id='Person Birth Date_0-0']//input`)).toHaveAttribute('type', 'Number');
        await expect(page.locator(`//div[@id='Person Birth Date_0-1']//input`)).toHaveAttribute('type', 'month');
        await expect(page.locator(`//div[@id='Person Birth Date_0-2']//input`)).toHaveAttribute('type', 'date');
        await expect(page.locator(`//div[@id='Person Birth Date_0-3']//input`)).toHaveAttribute(
            'type',
            'datetime-local'
        );
        await expect(page.locator(`//div[@id='Person Birth Date_0-3']//input`)).toHaveAttribute('step', '3600');
        await expect(page.locator(`//div[@id='Person Birth Date_0-4']//input`)).toHaveAttribute(
            'type',
            'datetime-local'
        );
        await expect(page.locator(`//div[@id='Person Birth Date_0-5']//input`)).toHaveAttribute(
            'type',
            'datetime-local'
        );
        await expect(page.locator(`//div[@id='Person Birth Date_0-5']//input`)).toHaveAttribute('step', '1');
    });

    await test.step(`Verify preview input type`, async () => {
        await previewSection.goToFormDescription();
        await expect(page.locator(`//div[@id='question_0-0']`)).toContainText('Year');
        await expect(page.locator(`//div[@id='question_0-1']`)).toContainText('Month');
        await expect(page.locator(`//div[@id='question_0-2']`)).not.toContainText('Day');
        await expect(page.locator(`//div[@id='question_0-3']`)).toContainText('Hour');
        await expect(page.locator(`//div[@id='question_0-4']`)).toContainText('Minute');
        await expect(page.locator(`//div[@id='question_0-5']`)).toContainText('Second');
    });
});
