import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { DataType, Version } from '../../../model/type';

test.describe.configure({ retries: 0, mode: 'serial' });
test.describe(`CDE date type`, async () => {
    const cdeName = 'Assessment date and time';

    test.beforeEach(async ({ page, navigationMenu }) => {
        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
            await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        });
    });

    test(`edit data type to Text, then save`, async ({
        request,
        page,
        materialPage,
        saveModal,
        itemLogAuditPage,
        navigationMenu,
        permissibleValueSection,
        identifierSection,
        historySection,
        auditTab,
    }) => {
        const updatedDatatypeText: DataType = {
            datatype: `Text`,
            minimalLength: 789,
            maximalLength: 987,
            datatypeTextRegex: 'newRegex',
            datatypeTextRule: 'newRule',
        };
        const editDatatypeTextVersionInfo: Version = {
            newVersion: '1',
            changeNote: '[edit data type Text]',
        };

        await permissibleValueSection.editDataType(updatedDatatypeText);
        await saveModal.publishNewVersionByType('cde', editDatatypeTextVersionInfo);

        await test.step(`Verify version number`, async () => {
            await identifierSection.verifyVersion(editDatatypeTextVersionInfo);
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [editDatatypeTextVersionInfo];
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
                await expect(newPage.getByText('').first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedDatatypeText.maximalLength.toString()).first()).toBeVisible();
            await expect(detailLocator.getByText(updatedDatatypeText.maximalLength.toString()).first()).toBeVisible();
            await expect(detailLocator.getByText(updatedDatatypeText.maximalLength.toString()).first()).toBeVisible();
            await expect(detailLocator.getByText(updatedDatatypeText.maximalLength.toString()).first()).toBeVisible();
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

    test(`edit data type to Date, then save`, async ({
        request,
        page,
        materialPage,
        saveModal,
        itemLogAuditPage,
        navigationMenu,
        permissibleValueSection,
        identifierSection,
        historySection,
        auditTab,
    }) => {
        const updatedDatatypeDate: DataType = {
            datatype: `Date`,
            precision: 'Year',
        };
        const editDatatypeDateVersionInfo: Version = {
            newVersion: '1',
            changeNote: '[edit data type Date]',
        };

        await permissibleValueSection.editDataType(updatedDatatypeDate);
        await saveModal.publishNewVersionByType('cde', editDatatypeDateVersionInfo);

        await test.step(`Verify version number`, async () => {
            await identifierSection.verifyVersion(editDatatypeDateVersionInfo);
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [editDatatypeDateVersionInfo];
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
                await expect(newPage.getByText('').first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedDatatypeDate.precision).first()).toBeVisible();
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

    test(`edit data type to Number, then save`, async ({
        request,
        page,
        materialPage,
        saveModal,
        itemLogAuditPage,
        navigationMenu,
        permissibleValueSection,
        identifierSection,
        historySection,
        auditTab,
    }) => {
        const updatedDatatypeNumber: DataType = {
            datatype: `Number`,
            minValue: 2,
            maxValue: 10,
            precision: '1',
            uom: 'g',
        };
        const editDatatypeNumberVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[edit data type Number]',
        };

        await permissibleValueSection.editDataType(updatedDatatypeNumber);
        await saveModal.publishNewVersionByType('cde', editDatatypeNumberVersionInfo);

        await test.step(`Verify version number`, async () => {
            await identifierSection.verifyVersion(editDatatypeNumberVersionInfo);
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [editDatatypeNumberVersionInfo];
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
                await expect(newPage.getByText('').first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedDatatypeNumber.precision).first()).toBeVisible();
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
    test(`edit data type to Dynamic Code List, then save`, async ({
        request,
        page,
        materialPage,
        saveModal,
        itemLogAuditPage,
        navigationMenu,
        permissibleValueSection,
        identifierSection,
        historySection,
        auditTab,
    }) => {
        const updatedDatatypeDynamicCodeList: DataType = {
            datatype: `Dynamic Code List`,
            system: 'VSAC',
            code: 'some OID',
        };
        const editDatatypeDynamicCodeListVersionInfo: Version = {
            newVersion: '4',
            changeNote: '[edit data type Dynamic Code List]',
        };

        await permissibleValueSection.editDataType(updatedDatatypeDynamicCodeList);
        await saveModal.publishNewVersionByType('cde', editDatatypeDynamicCodeListVersionInfo);

        await test.step(`Verify version number`, async () => {
            await identifierSection.verifyVersion(editDatatypeDynamicCodeListVersionInfo);
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [editDatatypeDynamicCodeListVersionInfo];
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
                await expect(newPage.getByText('').first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedDatatypeDynamicCodeList.system).first()).toBeVisible();
            await expect(detailLocator.getByText(updatedDatatypeDynamicCodeList.code).first()).toBeVisible();
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
