import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Version, Concept } from '../../../model/type';
import { Accounts } from '../../../data/user';
import { CdeTinyIds } from '../../../data/cde-tinyId';

test.describe.configure({ retries: 0 });
test.use({ video: 'on', trace: 'on' });
test(`Add CDE concepts`, async ({
    page,
    materialPage,
    navigationMenu,
    itemLogAuditPage,
    auditTab,
    saveModal,
    conceptSection,
    identifierSection,
    historySection,
}) => {
    const cdeName = 'Add concept cde';

    const newConcepts: Concept[] = [
        {
            conceptName: 'DEC1',
            conceptId: 'DEC_CODE_111',
            conceptSource: '',
            conceptType: 'Data Element Concept',
        },
        {
            conceptName: 'OC1',
            conceptId: 'OC_CODE_111',
            conceptSource: '',
            conceptType: 'Object Class',
        },
        {
            conceptName: 'Prop1',
            conceptId: 'Prop_CODE_111',
            conceptSource: '',
            conceptType: 'Property',
        },
    ];
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[add concepts]',
    };

    let existingVersion = '';

    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Concepts' })).toBeVisible();
        await page.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Get current version`, async () => {
        existingVersion = await page.locator(`[itemprop="version"]`).innerText();
    });

    await test.step(`Add new concepts, then save`, async () => {
        await conceptSection.addNewConcept(newConcepts[0]);
        await conceptSection.addNewConcept(newConcepts[1]);
        await conceptSection.addNewConcept(newConcepts[2]);
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
            await expect(materialPage.matDialog().getByText(newConcepts[0].conceptName)).toBeVisible();
            await expect(materialPage.matDialog().getByText(newConcepts[1].conceptName)).toBeVisible();
            await expect(materialPage.matDialog().getByText(newConcepts[2].conceptName)).toBeVisible();
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
            await newPage.getByRole('heading', { name: 'Concepts' }).scrollIntoViewIfNeeded();
            await expect(newPage.getByText(newConcepts[0].conceptName)).toBeVisible();
            await expect(newPage.getByText(newConcepts[1].conceptName)).toBeVisible();
            await expect(newPage.getByText(newConcepts[2].conceptName)).toBeVisible();
            await newPage.close();
        });
    });

    await test.step(`Verify CDE audit`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlm);
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
        await expect(detailLocator.getByText(cdeName).first()).toBeVisible();
        await expect(detailLocator.getByText('name: ' + newConcepts[0].conceptName)).toBeVisible();
        await expect(detailLocator.getByText('name: ' + newConcepts[1].conceptName)).toBeVisible();
        await expect(detailLocator.getByText('name: ' + newConcepts[2].conceptName)).toBeVisible();
    });
});
