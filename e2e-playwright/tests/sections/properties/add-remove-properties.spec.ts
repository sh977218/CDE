import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Version, Property } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { FormTinyIds } from '../../../data/form-tinyId';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test.describe(`add remove properties`, async () => {
    test(`cde`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        propertySection,
        identifierSection,
        historySection,
    }) => {
        const cdeName = 'Vision (aura) typical symptom type';
        const newProperty: Property = {
            key: 'pk1',
            value: `New <b>Value</b>`,
        };
        const addPropertyVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add properties]',
        };

        const deletePropertyVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[delete properties]',
        };

        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
        });

        await test.step(`add properties, then save`, async () => {
            await propertySection.addProperty(newProperty);
            await saveModal.publishNewVersionByType('cde', addPropertyVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(addPropertyVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [addPropertyVersionInfo];
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
                await expect(newPage.getByText(newProperty.value).first()).toBeVisible();
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
            await expect(detailLocator.getByText(newProperty.value).first()).toBeVisible();
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

        await test.step(`delete properties, then save`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await propertySection.deletePropertyByIndex(0);
            await saveModal.publishNewVersionByType('cde', deletePropertyVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(deletePropertyVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [deletePropertyVersionInfo];
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
            await expect(detailLocator.getByText(newProperty.value).first()).toBeVisible();
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

    test(`form`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        propertySection,
        identifierSection,
        historySection,
    }) => {
        const formName = 'Form Property Test';
        const newProperty: Property = {
            key: 'pk1',
            value: 'MyValue1',
        };
        const addPropertyVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add properties]',
        };

        const deletePropertyVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[delete properties]',
        };

        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
        });

        await test.step(`add properties, then save`, async () => {
            await propertySection.addProperty(newProperty);
            await saveModal.publishNewVersionByType('form', addPropertyVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(addPropertyVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [addPropertyVersionInfo];
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
                await expect(newPage.getByText(`this form is archived.`)).toBeVisible();
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/formView?tinyId=${FormTinyIds[formName]}`);
                await expect(newPage.getByText(newProperty.value).first()).toBeVisible();
                await newPage.close();
            });
        });

        await test.step(`Verify Form audit`, async () => {
            await navigationMenu.gotoAudit();
            await auditTab.formAuditLog().click();
            await page.route(`/server/log/itemLog/form`, async route => {
                await page.waitForTimeout(5000);
                await route.continue();
            });
            await page.getByRole('button', { name: 'Search', exact: true }).click();
            await materialPage.matSpinnerShowAndGone();
            await itemLogAuditPage.expandLogRecordByName(formName);
            const detailLocator = page.locator(`.example-element-detail`);
            await expect(detailLocator.getByText(newProperty.value).first()).toBeVisible();
        });

        await test.step(`delete property, then save`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await propertySection.deletePropertyByIndex(0);
            await saveModal.publishNewVersionByType('form', deletePropertyVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(deletePropertyVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [deletePropertyVersionInfo];
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
                await expect(newPage.getByText(`this form is archived.`)).toBeVisible();
                await newPage.getByText(`view the current version here`).click();
                await expect(newPage).toHaveURL(`/formView?tinyId=${FormTinyIds[formName]}`);
                await newPage.close();
            });
        });

        await test.step(`Verify Form audit`, async () => {
            await navigationMenu.gotoAudit();
            await auditTab.formAuditLog().click();
            await page.route(`/server/log/itemLog/form`, async route => {
                await page.waitForTimeout(5000);
                await route.continue();
            });
            await page.getByRole('button', { name: 'Search', exact: true }).click();
            await materialPage.matSpinnerShowAndGone();
            await itemLogAuditPage.expandLogRecordByName(formName);
            const detailLocator = page.locator(`.example-element-detail`);
            await expect(detailLocator.getByText(newProperty.value).first()).toBeVisible();
        });
    });
});
