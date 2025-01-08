import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';
import { CdeTinyIds } from '../../../data/cde-tinyId';

test.describe(`Steward Org`, async () => {
    test(`Org detail on CDE page`, async ({ materialPage, navigationMenu, generateDetailsSection }) => {
        const matTooltip = materialPage.matTooltip();
        const cdeName = 'Feature Modified By java.lang.String';
        await navigationMenu.gotoCdeByName(cdeName);
        await generateDetailsSection.stewardOrg().hover();
        await expect(matTooltip).toContainText('Organization Details');
        await expect(matTooltip).toContainText('Cancer Biomedical Informatics Grid');
        await expect(matTooltip).toContainText('123 Somewhere On Earth, Abc, Def, 20001');
        await expect(matTooltip).toContainText('caBig@nih.gov');
        await expect(matTooltip).toContainText('111-222-3333');
        await expect(matTooltip).toContainText('https://cabig.nci.nih.gov/');
    });

    test(`Change steward org`, async ({
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
        const cdeName = `Patient Tissue Specimen Colorectal Research Consent Ind-2`;
        const oldStewardOrg = 'CTEP';
        const updatedStewardOrg = 'NINDS';
        const updatedStewardOrgVersionInfo: Version = {
            newVersion: '1',
            changeNote: '[change steward org]',
        };
        await test.step(`Navigate to CDE and login`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.login(Accounts.nlm);
            await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
            await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
        });
        await test.step(`change steward org, then save`, async () => {
            await generateDetailsSection.editStewardOrg(updatedStewardOrg);
            await saveModal.publishNewVersionByType('cde', updatedStewardOrgVersionInfo);

            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(updatedStewardOrgVersionInfo);
            });
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                await expect(materialPage.matDialog().getByText(updatedStewardOrg)).toBeVisible();
                await materialPage.closeMatDialog();
            });

            const versionHistories = [updatedStewardOrgVersionInfo];
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
                await expect(newPage.getByText(oldStewardOrg).first()).toBeVisible();
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
            await expect(detailLocator.getByText(updatedStewardOrg).first()).toBeVisible();
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
