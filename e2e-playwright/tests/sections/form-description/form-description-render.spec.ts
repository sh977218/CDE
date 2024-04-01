import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Form description render`, async ({ page, navigationMenu, previewSection }) => {
    await navigationMenu.login(Accounts.nlm);
    const formName = 'Loinc Widget Test Form';
    await navigationMenu.gotoFormByName(formName);
    await previewSection.goToFormDescription();
    await expect(
        page.getByText('Embedded Form: Outside section form: PROMIS SF v1.0 - Phys. Function 10a')
    ).toBeVisible();
    await expect(page.getByText('section contains form')).toBeVisible();
    await expect(
        page.getByText('Embedded Form: Inside section form: PROMIS SF v1.0 - Phys. Function 10a')
    ).toBeVisible();

    await expect(
        page.getByText(
            'Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?'
        )
    ).toBeHidden();
    await expect(page.locator(`#form_0 .expand-form`).getByText('Expand')).toBeVisible();
    await page.locator('#form_0 .expand-form').click();
    await expect(
        page.getByText(
            'Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?'
        )
    ).toBeVisible();
    await expect(page.locator(`#form_0 .expand-form`).getByText('Expand')).toBeHidden();
    await expect(page.locator(`#form_0 .expand-form`).getByText('Collapse')).toBeVisible();
    await page.locator('#form_0 .expand-form').click();
    await expect(
        page.getByText(
            'Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?'
        )
    ).toBeHidden();
    await expect(page.locator(`#form_0 .expand-form`).getByText('Expand')).toBeVisible();
});
