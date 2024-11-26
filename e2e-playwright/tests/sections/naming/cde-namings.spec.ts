import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Designation, Definition, Version } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0, mode: 'serial' });
test.describe(`CDE name`, async () => {
    const cdeName = 'Mediastinal Lymph Node Physical Examination Specify';

    test.beforeEach(async ({ page, navigationMenu }) => {
        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
            await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        });
    });

    test.describe(`designation `, async () => {
        const newDesignation: Designation = {
            designation: `this is a new designation added on `,
            sources: [],
            tags: [],
        };
        const addDesignationVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add designation]',
        };

        const updatedDesignation: Designation = {
            designation: `designation updated on `,
            sources: [],
            tags: [],
        };
        const editDesignationVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[edit designation]',
        };

        const deleteDesignationVersionInfo: Version = {
            newVersion: '4',
            changeNote: '[delete designation]',
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
            await test.step(`add designation, then save`, async () => {
                await generateDetailsSection.addName(newDesignation);
                await saveModal.publishNewVersionByType('cde', addDesignationVersionInfo);

                await test.step(`Verify version number`, async () => {
                    await identifierSection.verifyVersion(addDesignationVersionInfo);
                });
            });

            await test.step(`Verify history`, async () => {
                if (await page.locator('id=expandHistory').isVisible()) {
                    await page.locator('id=expandHistory').click();
                }
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
            await test.step(`edit designation, then save`, async () => {
                await generateDetailsSection.editDesignationByIndex(1, updatedDesignation, { replace: true });
                await saveModal.publishNewVersionByType('cde', editDesignationVersionInfo);

                await test.step(`Verify version number`, async () => {
                    await identifierSection.verifyVersion(editDesignationVersionInfo);
                });
            });

            await test.step(`Verify history`, async () => {
                if (await page.locator('id=expandHistory').isVisible()) {
                    await page.locator('id=expandHistory').click();
                }
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
            await test.step(`delete designation, then save`, async () => {
                await generateDetailsSection.deleteDesignationByIndex(1);
                // await expect(page.getByText(newDesignation.designation)).toBeHidden();
                await saveModal.publishNewVersionByType('cde', deleteDesignationVersionInfo);

                await test.step(`Verify version number`, async () => {
                    await identifierSection.verifyVersion(deleteDesignationVersionInfo);
                });
            });

            await test.step(`Verify history`, async () => {
                if (await page.locator('id=expandHistory').isVisible()) {
                    await page.locator('id=expandHistory').click();
                }
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

    test.describe(`definition`, async () => {
        const newDefinition: Definition = {
            definition: `this is a new definition added on `,
            sources: [],
            tags: [],
        };
        const updatedDefinition: Definition = {
            definition: `updated updated on `,
            sources: [],
            tags: [],
        };
        const addDefinitionVersionInfo: Version = {
            newVersion: '5',
            changeNote: '[add definition]',
        };
        const editDefinitionVersionInfo: Version = {
            newVersion: '6',
            changeNote: '[edit definition]',
        };
        const deleteDefinitionVersionInfo: Version = {
            newVersion: '7',
            changeNote: '[delete definition]',
        };

        test(`add definition`, async ({
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
            await test.step(`add definition, then save`, async () => {
                await generateDetailsSection.addDefinition(newDefinition);
                await saveModal.publishNewVersionByType('cde', addDefinitionVersionInfo);

                await test.step(`Verify version number`, async () => {
                    await identifierSection.verifyVersion(addDefinitionVersionInfo);
                });
            });

            await test.step(`Verify history`, async () => {
                await page.locator('id=expandHistory').click();

                const versionHistories = [addDefinitionVersionInfo];
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
                    await expect(newPage.getByText(newDefinition.definition).first()).toBeVisible();
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
                await expect(detailLocator.getByText(newDefinition.definition).first()).toBeVisible();
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

        // test(`edit definition`, async ({
        //     request,
        //     page,
        //     materialPage,
        //     navigationMenu,
        //     itemLogAuditPage,
        //     auditTab,
        //     saveModal,
        //     generateDetailsSection,
        //     identifierSection,
        //     historySection,
        // }) => {
        //     await test.step(`edit definition, then save`, async () => {
        //         await generateDetailsSection.editDefinitionByIndex(0, updatedDefinition);
        //         await saveModal.newVersionByType('cde', editDefinitionVersionInfo);
        //
        //         await test.step(`Verify version number`, async () => {
        //             await identifierSection.verifyVersion(editDefinitionVersionInfo);
        //         });
        //     });
        //
        //     await test.step(`Verify history`, async () => {
        //         await page.locator('id=expandHistory').click();
        //
        //         const versionHistories = [editDefinitionVersionInfo];
        //         for (let [index, versionInfo] of versionHistories.reverse().entries()) {
        //             const historyTableRow = historySection.historyTableRows().nth(index);
        //             await expect(historyTableRow.locator(historySection.historyTableVersion())).toHaveText(
        //                 versionInfo.newVersion
        //             );
        //             await expect(historyTableRow.locator(historySection.historyTableChangeNote())).toHaveText(
        //                 versionInfo.changeNote
        //             );
        //         }
        //
        //         await test.step(`Verify prior element`, async () => {
        //             const [newPage] = await Promise.all([
        //                 page.context().waitForEvent('page'),
        //                 historySection.historyTableRows().nth(1).locator('mat-icon').click(),
        //             ]);
        //             await expect(newPage.getByText(`this data element is archived.`)).toBeVisible();
        //             await newPage.getByText(`view the current version here`).click();
        //             await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
        //             await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        //             await expect(newPage.getByText(updatedDefinition.definition).first()).toBeVisible();
        //             await newPage.close();
        //         });
        //     });
        //
        //     await test.step(`Verify CDE audit`, async () => {
        //         await navigationMenu.gotoAudit();
        //         await auditTab.cdeAuditLog().click();
        //         await page.route(`/server/log/itemLog/de`, async route => {
        //             await page.waitForTimeout(5000);
        //             await route.continue();
        //         });
        //         await page.getByRole('button', { name: 'Search', exact: true }).click();
        //         await materialPage.matSpinnerShowAndGone();
        //         await itemLogAuditPage.expandLogRecordByName(cdeName);
        //         const detailLocator = page.locator(`.example-element-detail`);
        //         await expect(detailLocator.getByText(newDefinition.definition).first()).toBeVisible();
        //     });
        //
        //     await test.step(`Verify API`, async () => {
        //         await test.step(`Verify modify since API - success`, async () => {
        //             const response = await request.get(`/api/de/modifiedElements?from=2016-01-01`);
        //             const responseJson = await response.json();
        //             const responseBody = await response.body();
        //             expect(Array.isArray(responseJson)).toBeTruthy();
        //             expect(responseJson.length).toBeTruthy();
        //             expect(responseBody.toString()).toContain(CdeTinyIds[cdeName]);
        //         });
        //
        //         await test.step(`Verify modify since API - wrong format`, async () => {
        //             const response = await request.get(`/api/de/modifiedElements?from=2016-25-01`);
        //             expect(response.status()).toBe(300);
        //         });
        //     });
        // });
        //
        // test(`delete definition`, async ({
        //     request,
        //     page,
        //     materialPage,
        //     navigationMenu,
        //     itemLogAuditPage,
        //     auditTab,
        //     saveModal,
        //     generateDetailsSection,
        //     identifierSection,
        //     historySection,
        // }) => {
        //     await test.step(`delete definition, then save`, async () => {
        //         await generateDetailsSection.deleteDefinitionByDefinition(updatedDefinition.definition);
        //         await saveModal.newVersionByType('cde', deleteDefinitionVersionInfo);
        //
        //         await test.step(`Verify version number`, async () => {
        //             await identifierSection.verifyVersion(deleteDefinitionVersionInfo);
        //         });
        //     });
        //
        //     await test.step(`Verify history`, async () => {
        //         await page.locator('id=expandHistory').click();
        //
        //         const versionHistories = [deleteDefinitionVersionInfo];
        //         for (let [index, versionInfo] of versionHistories.reverse().entries()) {
        //             const historyTableRow = historySection.historyTableRows().nth(index);
        //             await expect(historyTableRow.locator(historySection.historyTableVersion())).toHaveText(
        //                 versionInfo.newVersion
        //             );
        //             await expect(historyTableRow.locator(historySection.historyTableChangeNote())).toHaveText(
        //                 versionInfo.changeNote
        //             );
        //         }
        //
        //         await test.step(`Verify prior element`, async () => {
        //             const [newPage] = await Promise.all([
        //                 page.context().waitForEvent('page'),
        //                 historySection.historyTableRows().nth(1).locator('mat-icon').click(),
        //             ]);
        //             await expect(newPage.getByText(`this data element is archived.`)).toBeVisible();
        //             await newPage.getByText(`view the current version here`).click();
        //             await expect(newPage).toHaveURL(`/deView?tinyId=${CdeTinyIds[cdeName]}`);
        //             await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        //             await expect(newPage.getByText(newDefinition.definition)).toBeHidden();
        //             await newPage.close();
        //         });
        //     });
        //
        //     await test.step(`Verify CDE audit`, async () => {
        //         await navigationMenu.gotoAudit();
        //         await auditTab.cdeAuditLog().click();
        //         await page.route(`/server/log/itemLog/de`, async route => {
        //             await page.waitForTimeout(5000);
        //             await route.continue();
        //         });
        //         await page.getByRole('button', { name: 'Search', exact: true }).click();
        //         await materialPage.matSpinnerShowAndGone();
        //         await itemLogAuditPage.expandLogRecordByName(cdeName);
        //         const detailLocator = page.locator(`.example-element-detail`);
        //         await expect(detailLocator.getByText(newDefinition.definition).first()).toBeVisible();
        //     });
        //
        //     await test.step(`Verify API`, async () => {
        //         await test.step(`Verify modify since API - success`, async () => {
        //             const response = await request.get(`/api/de/modifiedElements?from=2016-01-01`);
        //             const responseJson = await response.json();
        //             const responseBody = await response.body();
        //             expect(Array.isArray(responseJson)).toBeTruthy();
        //             expect(responseJson.length).toBeTruthy();
        //             expect(responseBody.toString()).toContain(CdeTinyIds[cdeName]);
        //         });
        //
        //         await test.step(`Verify modify since API - wrong format`, async () => {
        //             const response = await request.get(`/api/de/modifiedElements?from=2016-25-01`);
        //             expect(response.status()).toBe(300);
        //         });
        //     });
        // });
    });
});
