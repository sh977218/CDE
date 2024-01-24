import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import cdeTinyId from '../../../data/cde-tinyId';
import user from '../../../data/user';
import { Designation, Definition, Version } from '../../../src/model/type';

test.describe.configure({ retries: 0 });
test(`Edit CDE names`, async ({
    request,
    page,
    materialPage,
    cdePage,
    navigationMenu,
    itemLogAuditPage,
    auditTab,
    saveModal,
    generateDetailsSection,
    identifierSection,
    historySection,
}) => {
    const cdeName = 'Mediastinal Lymph Node Physical Examination Specify';

    const newDesignation: Designation = {
        designation: `[designation change number 1]`,
        tags: [],
    };
    const newDefinition: Definition = {
        definition: `[definition change number 1]`,
        tags: [],
    };
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[add namings]',
    };

    let existingVersion = '';

    await test.step(`Navigate to CDE and login`, async () => {
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await expect(page.getByRole('heading', { name: 'CDE Details' })).toBeVisible();
        await page.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Get current version`, async () => {
        existingVersion = await page.locator(`[itemprop="version"]`).innerText();
    });

    await test.step(`edit name and definition, then save`, async () => {
        await generateDetailsSection.editNameByIndex(0, newDesignation);
        await generateDetailsSection.editDefinitionByIndex(0, newDefinition);
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
            await newPage.getByText(`view the current version here`).click();
            await expect(newPage).toHaveURL(`/deView?tinyId=${cdeTinyId[cdeName]}`);
            await newPage.getByRole('heading', { name: 'CDE Details' }).scrollIntoViewIfNeeded();
            await expect(newPage.getByText(newDesignation.designation).first()).toBeVisible();
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
        await materialPage.matSpinner().waitFor();
        await materialPage.matSpinner().waitFor({ state: 'hidden' });
        await itemLogAuditPage.expandLogRecordByName(cdeName);
        const detailLocator = page.locator(`.example-element-detail`);
        await expect(detailLocator.getByText(newDesignation.designation + cdeName).first()).toBeVisible();
    });

    await test.step(`Verify API`, async () => {
        await test.step(`Verify modify since API - success`, async () => {
            const response = await request.get(`/api/de/modifiedElements?from=2016-01-01`);
            const responseJson = await response.json();
            const responseBody = await response.body();
            expect(Array.isArray(responseJson)).toBeTruthy();
            expect(responseJson.length).toBeTruthy();
            expect(responseBody.toString()).toContain(cdeTinyId[cdeName]);
        });

        await test.step(`Verify modify since API - wrong format`, async () => {
            const response = await request.get(`/api/de/modifiedElements?from=2016-25-01`);
            expect(response.status()).toBe(300);
        });
    });
});
