import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Designation, Version } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0, mode: 'serial' });
test.describe(`CDE designation`, async () => {
    const cdeName = 'Left Lymph Node Positive Total Count';
    const rightNow = new Date().valueOf();

    test.beforeEach(async ({ page, navigationMenu }) => {
        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
            await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        });
    });
    const updatedDesignation: Designation = {
        designation: `designation updated on ${rightNow}`,
        sources: [],
        tags: [],
    };

    test(`add designation `, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        generateDetailsSection,
        identifierSection,
        historySection,
    }) => {
        const newDesignation: Designation = {
            designation: `this is a new designation added on ${rightNow}`,
            sources: [],
            tags: [],
        };
        const addDesignationVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add designation]',
        };

        await test.step(`add designation, then save`, async () => {
            await generateDetailsSection.addName(newDesignation);
            await saveModal.publishNewVersionByType('cde', addDesignationVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(addDesignationVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                await expect(materialPage.matDialog().getByText(newDesignation.designation)).toBeVisible();
                await materialPage.closeMatDialog();
            });

            const versionHistories = [addDesignationVersionInfo];
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
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
                await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
                await expect(newPage.getByText(newDesignation.designation).first()).toBeVisible();
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
            await expect(detailLocator.getByText(newDesignation.designation).first()).toBeVisible();
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

    test(`edit designation`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        generateDetailsSection,
        identifierSection,
        historySection,
    }) => {
        const editDesignationVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[edit designation]',
        };
        await test.step(`edit designation, then save`, async () => {
            await generateDetailsSection.editDesignationByIndex(1, updatedDesignation, { replace: true });
            await saveModal.publishNewVersionByType('cde', editDesignationVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(editDesignationVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                await expect(materialPage.matDialog().getByText(updatedDesignation.designation)).toBeVisible();
                await materialPage.closeMatDialog();
            });

            const versionHistories = [editDesignationVersionInfo];
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
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
                await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
                await expect(newPage.getByText(updatedDesignation.designation).first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedDesignation.designation).first()).toBeVisible();
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

    test(`delete designation`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        generateDetailsSection,
        identifierSection,
        historySection,
    }) => {
        const deleteDesignationVersionInfo: Version = {
            newVersion: '4',
            changeNote: '[delete designation]',
        };
        await test.step(`delete designation, then save`, async () => {
            await generateDetailsSection.deleteDesignationByIndex(1);
            // await expect(page.getByText(newDesignation.designation)).toBeHidden();
            await saveModal.publishNewVersionByType('cde', deleteDesignationVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(deleteDesignationVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                await expect(materialPage.matDialog().getByText(updatedDesignation.designation)).toBeVisible();
                await materialPage.closeMatDialog();
            });

            const versionHistories = [deleteDesignationVersionInfo];
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
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
                await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
                // await expect(newPage.getByText(newDesignation.designation)).toBeHidden();
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
            await expect(detailLocator.getByText(updatedDesignation.designation).first()).toBeVisible();
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
});
