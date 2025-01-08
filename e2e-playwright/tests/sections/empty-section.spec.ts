import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test('Empty section menu', async ({ page, navigationMenu, generateDetailsSection }) => {
    const cdeName = 'Empty sub sections CDE';
    const subSectionsHideWhenEmpty = [
        'Classification',
        'Related Documents',
        'Properties',
        'Attachments',
        'History',
        'Rules',
        'Derivation Rules',
    ];
    const subSectionsShowWhenEmpty = ['CDE Summary', 'Status', 'Concepts', 'Submission Information'];
    await test.step(`Login`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
    });

    await test.step(`Hide empty section when not logged in `, async () => {
        for (const subsection of subSectionsHideWhenEmpty) {
            await expect(page.locator('.toc-list')).not.toContainText(subsection);
        }
    });
    await test.step(`Show empty section when not logged in `, async () => {
        for (const subsection of subSectionsShowWhenEmpty) {
            await expect(page.locator('.toc-list')).toContainText(subsection);
        }
    });
    await test.step(`Show all sections when login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        for (const subsection of [...subSectionsHideWhenEmpty, ...subSectionsShowWhenEmpty]) {
            await expect(page.locator('.toc-list')).toContainText(subsection);
        }
    });
});
