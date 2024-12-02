import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Version, RelatedDocument } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { FormTinyIds } from '../../../data/form-tinyId';
import { Accounts } from '../../../data/user';

test.describe.configure({ retries: 0 });
test.describe(`add remove related document`, async () => {
    test(`cde`, async ({
        request,
        page,
        materialPage,
        navigationMenu,
        itemLogAuditPage,
        auditTab,
        saveModal,
        relatedDocumentSection,
        identifierSection,
        historySection,
    }) => {
        const cdeName = 'Post traumatic amnesia verify type';
        const newRelatedDocument: RelatedDocument = {
            id: 'test id',
            title: 'test title',
            docType: 't',
            uri: 'www.nih.gov',
            providerOrg: 'test provider org',
            languageCode: 'test language code',
            document: 'cde very very very long test document',
        };
        const addRelatedDocumentVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add related document]',
        };

        const deleteRelatedDocumentVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[delete related document]',
        };

        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
        });

        await test.step(`add related document, then save`, async () => {
            await relatedDocumentSection.addRelatedDocument(newRelatedDocument);
            await saveModal.publishNewVersionByType('cde', addRelatedDocumentVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(addRelatedDocumentVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [addRelatedDocumentVersionInfo];
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
                await expect(newPage.getByText(newRelatedDocument.title).first()).toBeVisible();
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
            await expect(detailLocator.getByText(newRelatedDocument.title).first()).toBeVisible();
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

        await test.step(`delete related document, then save`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await relatedDocumentSection.deleteRelatedDocumentByIndex(0);
            await saveModal.publishNewVersionByType('cde', deleteRelatedDocumentVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(deleteRelatedDocumentVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [deleteRelatedDocumentVersionInfo];
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
            await expect(detailLocator.getByText(newRelatedDocument.document).first()).toBeVisible();
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
        relatedDocumentSection,
        identifierSection,
        historySection,
    }) => {
        const formName = 'PROMIS SF v1.0-Anxiety 8a';
        const newRelatedDocument: RelatedDocument = {
            id: 'test id',
            title: 'test title',
            docType: 't',
            uri: 'www.nih.gov',
            providerOrg: 'test provider org',
            languageCode: 'test language code',
            document: 'form very very very long test document',
        };
        const addRelatedDocumentVersionInfo: Version = {
            newVersion: '2',
            changeNote: '[add related document]',
        };

        const deleteRelatedDocumentVersionInfo: Version = {
            newVersion: '3',
            changeNote: '[delete related document]',
        };

        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await navigationMenu.login(Accounts.nlm);
        });

        await test.step(`add related document, then save`, async () => {
            await relatedDocumentSection.addRelatedDocument(newRelatedDocument);
            await saveModal.publishNewVersionByType('form', addRelatedDocumentVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(addRelatedDocumentVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [addRelatedDocumentVersionInfo];
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
                await expect(newPage.getByText(newRelatedDocument.title).first()).toBeVisible();
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
            await expect(detailLocator.getByText(newRelatedDocument.title).first()).toBeVisible();
        });

        await test.step(`delete related document, then save`, async () => {
            await navigationMenu.gotoFormByName(formName);
            await relatedDocumentSection.deleteRelatedDocumentByIndex(0);
            await saveModal.publishNewVersionByType('form', deleteRelatedDocumentVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(deleteRelatedDocumentVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            if (await page.locator('id=expandHistory').isVisible()) {
                await page.locator('id=expandHistory').click();
            }
            const versionHistories = [deleteRelatedDocumentVersionInfo];
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
            await expect(detailLocator.getByText(newRelatedDocument.document).first()).toBeVisible();
        });
    });
});
