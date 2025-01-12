import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';

test.describe(`CDE Origin`, async () => {
    test(`CDE page`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        generateDetailsSection,
        historySection,
        identifierSection,
        saveModal,
        auditTab,
        itemLogAuditPage,
    }) => {
        const cdeName =
            'Atherosclerosis Risk in Communities transient ischemic attack/stroke form (ARIC TIA) - speech loss slurred symptom indicator';
        const updatedOrigin = 'new origin ' + new Date().valueOf();
        const updatedOriginVersionInfo: Version = {
            newVersion: '1',
            changeNote: '[change origin]',
        };
        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
            await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        });
        await test.step(`change origin, then save`, async () => {
            await generateDetailsSection.editOrigin(updatedOrigin);
            await saveModal.publishNewVersionByType('cde', updatedOriginVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(updatedOriginVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                // await expect(materialPage.matDialog().getByText(updatedOrigin)).toBeVisible(); @TODO bug: compare modal does not show origin changes
                await materialPage.closeMatDialog();
            });

            const versionHistories = [updatedOriginVersionInfo];
            for (let [index, versionInfo] of versionHistories.reverse().entries()) {
                const historyTableRow = historySection.historyTableRows().nth(index);
                await expect(historyTableRow.locator(historySection.historyTableVersion())).toHaveText(
                    versionInfo.newVersion
                );
                await expect(historyTableRow.locator(historySection.historyTableChangeNote())).toHaveText(
                    versionInfo.changeNote
                );
            }

            await test.step(`Verify prior element`, async () => {
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    historySection.historyTableRows().nth(1).locator('mat-icon').click(),
                ]);
                await expect(newPage.getByText(`this data element is archived.`)).toBeVisible();
                await expect(newPage.getByText(updatedOrigin)).toBeHidden();
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
                await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
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
            await expect(detailLocator.getByText(updatedOrigin).first()).toBeVisible();
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

    test(`Form page`, async ({ formPage, generateDetailsSection, navigationMenu, inlineEdit }) => {
        const newOrigin = 'new origin ' + new Date().valueOf();
        const formName = 'Measures of Gas Exchange';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);
        await generateDetailsSection.editOrigin(newOrigin);
    });
});
