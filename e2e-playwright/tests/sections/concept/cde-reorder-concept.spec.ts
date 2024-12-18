import { test } from '../../../fixtures/base-fixtures';
import { Version } from '../../../model/type';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';
import { CdeTinyIds } from '../../../data/cde-tinyId';

test(`Reorder CDE concepts`, async ({
    page,
    cdePage,
    materialPage,
    itemLogAuditPage,
    auditTab,
    navigationMenu,
    saveModal,
    conceptSection,
    identifierSection,
    historySection,
}) => {
    const cdeName = 'Reorder concept cde';

    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[reorder concepts]',
    };
    let existingVersion = '';
    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Concepts' })).toBeVisible();
        await page.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Get current version`, async () => {
        existingVersion = await page.locator(`[itemprop="version"]`).innerText();
    });

    await test.step(`Reorder concepts, then save`, async () => {
        const conceptNamesBeforeOrder = await page.getByTestId(`concept-name`).allInnerTexts();

        await conceptSection.reorderConceptByIndex(0, 'Move down');
        await conceptSection.reorderConceptByIndex(2, 'Move up');
        await conceptSection.reorderConceptByIndex(2, 'Move to top');
        const conceptNamesAfterOrder = await page.getByTestId(`concept-name`).allInnerTexts();

        expect(conceptNamesBeforeOrder).toEqual(conceptNamesAfterOrder);
        await saveModal.publishNewVersionByType('cde', versionInfo);
    });

    await test.step(`Verify version number`, async () => {
        await identifierSection.verifyVersion(versionInfo, existingVersion);
    });

    await test.step(`Verify history`, async () => {
        await page.getByRole('heading', { name: 'History' }).scrollIntoViewIfNeeded();
        await expect(historySection.historyTableRows().first()).toContainText(versionInfo.changeNote);

        await test.step(`Verify compare`, async () => {
            await historySection.selectHistoryTableRowsToCompare(0, 1);
            await materialPage.closeMatDialog();
        });

        await test.step(`Verify prior element`, async () => {
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                historySection.historyTableRows().nth(1).locator('mat-icon').click(),
            ]);
            await newPage.waitForURL(/\/deView\?cdeId=*/);
            await expect(newPage.getByText(`this data element is archived.`)).toBeVisible();
            await newPage.getByText(`view the current version here`).click();
            await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
            await newPage.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
            await newPage.close();
        });
    });

    await test.step(`Verify CDE audit`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoAudit();
        await auditTab.cdeAuditLog().click();
        await page.route(`/server/log/itemLog/de`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinnerShowAndGone();
        await itemLogAuditPage.expandLogRecordByName(cdeName);
        const detailLocator = page.locator(`.example-element-detail`);
        await expect(detailLocator.getByText(cdeName).first()).toBeVisible();
    });
});
