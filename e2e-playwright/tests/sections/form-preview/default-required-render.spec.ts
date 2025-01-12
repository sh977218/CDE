import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Default and required render`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
    const formName = 'Required and Default Test';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`verify default render view`, async () => {
        await expect(
            previewSection
                .previewDiv()
                .getByTitle(
                    'Over the last 2 weeks how often have you been bothered by having little interest or pleasure in doing things?'
                )
                .getByRole('radio', { name: 'not at all' })
        ).toHaveAttribute('value');
        await expect(
            previewSection
                .previewDiv()
                .getByTitle(
                    'Over the last 2 weeks how often have you been bothered by feeling down depressed or hopeless?'
                )
                .getByRole('checkbox', { name: 'not at all' })
        ).toHaveAttribute('value');
        const questionsWithDefaultTextValue = [
            'Date of admission to acute care unit',
            'If yes Number of aborted procedures',
            'AIS grade',
            'Activity descriptor',
        ];
        for (const questionWithDefaultTextValue of questionsWithDefaultTextValue) {
            expect(
                await previewSection.previewDiv().getByTitle(questionWithDefaultTextValue).inputValue()
            ).toBeDefined();
        }
    });

    await test.step(`toggle publish`, async () => {
        await saveModal.toggleDraftPublish();
    });

    await test.step(`verify required render view`, async () => {
        for (const questionDiv of await previewSection.questionDiv().all()) {
            await expect(questionDiv.locator('code')).toHaveText('Please fill out this field.');
        }

        const trs = await previewSection.previewDiv().locator('cde-native-table tbody tr').all();
        for (const tr of trs) {
            const [, ...tds] = await tr.locator(`td`).all();
            for (const td of tds) {
                await expect(td).toContainText('Please fill out this field.');
            }
        }

        for (const tr of await previewSection
            .previewDiv()
            .locator(`cde-native-section-matrix tbody tr:nth-child(even)`)
            .all()) {
            await expect(tr).toHaveText('Please fill out this field.');
        }
    });
});
