import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import cdeTinyId from '../../../data/cde-tinyId';
import user from '../../../data/user';
import { Version } from '../../../src/model/type';

test.describe.configure({ retries: 0 });

test(`Remove CDE concepts`, async ({
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
    const cdeName = 'Remove concept cde';
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[remove concepts]',
    };
    let existingVersion = '';
    const existingConceptCodes = [`CONCEPT_CODE_1`, `CONCEPT_CODE_2`, `CONCEPT_CODE_3`];

    await test.step(`Navigate to CDE and login`, async () => {
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await expect(page.getByRole('heading', { name: 'Concepts' })).toBeVisible();
        await page.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
        existingVersion = await page.locator(`[itemprop="version"]`).innerText();
    });

    await test.step(`Remove concepts, then save`, async () => {
        await conceptSection.removeConceptByIndex('Data Element Concept', 0);
        await conceptSection.removeConceptByIndex('Object Class', 0);
        await conceptSection.removeConceptByIndex('Property', 0);
        await saveModal.newVersion('Data Element saved.', versionInfo);
    });

    await test.step(`Verify version number`, async () => {
        await identifierSection.verifyVersion(versionInfo, existingVersion);
    });

    await test.step(`Verify history`, async () => {
        await page.getByRole('heading', { name: 'History' }).scrollIntoViewIfNeeded();
        await expect(historySection.historyTableRows().first()).toContainText(versionInfo.changeNote);

        await test.step(`Verify prior element`, async () => {
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                historySection.historyTableRows().nth(1).locator('mat-icon').click(),
            ]);
            await expect(newPage.getByText(`Warning: this data element is archived.`)).toBeVisible();
            await expect(newPage.getByText(existingConceptCodes[0])).toBeVisible();
            await expect(newPage.getByText(existingConceptCodes[1])).toBeVisible();
            await expect(newPage.getByText(existingConceptCodes[2])).toBeVisible();
            await newPage.getByText(`view the current version here`).click();
            await expect(newPage).toHaveURL(`/deView?tinyId=${cdeTinyId[cdeName]}`);
            await newPage.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
            await expect(newPage.getByText(existingConceptCodes[0])).toBeHidden();
            await expect(newPage.getByText(existingConceptCodes[1])).toBeHidden();
            await expect(newPage.getByText(existingConceptCodes[2])).toBeHidden();
            await newPage.close();
        });

        await historySection.selectHistoryTableRowsToCompare(0, 1);
        await expect(materialPage.matDialog().getByText(existingConceptCodes[0])).toBeVisible();
        await expect(materialPage.matDialog().getByText(existingConceptCodes[1])).toBeVisible();
        await expect(materialPage.matDialog().getByText(existingConceptCodes[2])).toBeVisible();
        await materialPage.closeMatDialog();
    });

    await test.step(`Verify CDE audit`, async () => {
        await navigationMenu.gotoAudit();
        await auditTab.cdeAuditLog().click();
        await page.route(`/server/log/itemLog/de`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        await itemLogAuditPage.expandLogRecordByName(cdeName);
        const detailLocator = page.locator(`.example-element-detail`);
        await expect(detailLocator.getByText(cdeName).first()).toBeVisible();
        await expect(detailLocator.getByText(existingConceptCodes[0])).toBeVisible();
        await expect(detailLocator.getByText(existingConceptCodes[1])).toBeVisible();
        await expect(detailLocator.getByText(existingConceptCodes[2])).toBeVisible();
    });
});
