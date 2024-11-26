import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Version, DataType } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test(`Edit CDE data type`, async ({
    request,
    page,
    materialPage,
    navigationMenu,
    itemLogAuditPage,
    auditTab,
    saveModal,
    permissibleValueSection,
    identifierSection,
    historySection,
}) => {
    const cdeName = 'Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency';

    const newDataType: DataType = {
        datatype: `Text`,
        minimalLength: 789,
        maximalLength: 987,
        datatypeTextRegex: 'newRegex',
        datatypeTextRule: 'newRule',
    };
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[edit data type]',
    };

    let existingVersion = '';

    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
        await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Get current version`, async () => {
        existingVersion = await page.locator(`[itemprop="version"]`).innerText();
    });

    await test.step(`edit data type, then save`, async () => {
        await permissibleValueSection.editDataType(newDataType);
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
            await expect(materialPage.matDialog().getByText(newDataType.datatype).first()).toBeVisible();
            await expect(
                materialPage.matDialog().getByText(newDataType.minimalLength!.toString()).first()
            ).toBeVisible();
            await expect(
                materialPage.matDialog().getByText(newDataType.maximalLength!.toString()).first()
            ).toBeVisible();
            await expect(materialPage.matDialog().getByText(newDataType.datatypeTextRegex!).first()).toBeVisible();
            await expect(materialPage.matDialog().getByText(newDataType.datatypeTextRule!).first()).toBeVisible();
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
            await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
            await expect(newPage.getByText(newDataType.minimalLength!.toString()).first().first()).toBeVisible();
            await expect(newPage.getByText(newDataType.minimalLength!.toString()).first().first()).toBeVisible();
            await expect(newPage.getByText(newDataType.datatypeTextRegex!).first().first()).toBeVisible();
            await expect(newPage.getByText(newDataType.datatypeTextRule!).first().first()).toBeVisible();
            await newPage.close();
        });
    });

    await test.step(`Verify CDE audit`, async () => {
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
        await expect(detailLocator.getByText(`Permissible Values - Value Type`).first()).toBeVisible();
    });

    await test.step(`Verify API`, async () => {
        await test.step(`Verify modify since API - success`, async () => {
            const response = await request.get(`/api/de/modifiedElements?from=2016-01-01`);
            const responseJson = await response.json();
            const responseBody = await response.body();
            expect(Array.isArray(responseJson)).toBeTruthy();
            expect(responseJson.length).toBeTruthy();
            expect(responseBody.toString()).toContain(CdeTinyIds[cdeName]);
        });

        await test.step(`Verify modify since API - wrong format`, async () => {
            const response = await request.get(`/api/de/modifiedElements?from=2016-25-01`);
            expect(response.status()).toBe(300);
        });
    });
});
