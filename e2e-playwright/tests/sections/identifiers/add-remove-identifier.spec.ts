import { expect } from '@playwright/test';

import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';
import { FormTinyIds } from '../../../data/form-tinyId';

test.describe.configure({ retries: 0 });
test.describe(`add remove identifier`, async () => {
    test.beforeEach(async ({ navigationMenu }) => {
        await test.step(`Login`, async () => {
            await navigationMenu.login(Accounts.nlm);
        });
    });
    test(`cde add identifier`, async ({
        page,
        saveModal,
        navigationMenu,
        settingMenu,
        searchPage,
        idSourcesPage,
        identifierSection,
    }) => {
        const cdeName = 'Prostatectomy Performed Date';
        await navigationMenu.gotoSettings();
        await settingMenu.idSourcesMenu().click();
        await idSourcesPage.addIdSource(
            'test1',
            'http://cde.nlm.nih.gov/deView?tinyId={{id}}&version={{version}}',
            'http://cde.nlm.nih.gov/formView?tinyId={{id}}&version={{version}}'
        );
        await navigationMenu.gotoCdeByName(cdeName);

        // same ID as "more injuries loss of consciousness number"
        await identifierSection.addIdentifier({ source: 'caDSR', id: 'C18059', version: '3' });
        await identifierSection.addIdentifier({ source: 'test1', id: 'X1gI_mHF' });

        await test.step(`Verify CDE id's LINK`, async () => {
            const [, newPage] = await Promise.all([
                page.locator(`cde-identifiers table tbody tr`, { hasText: 'test1' }).getByRole('link').click(),
                page.waitForEvent('popup'),
            ]);
            await expect(newPage.getByText('Christophe Test CDE 31')).not.toHaveCount(0);
            await newPage.close();
        });

        await saveModal.publishNewVersionByType('cde');

        await test.step(`Verify id is searchable`, async () => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.searchWithString(`ids.id:C18059`, 2);
            await searchPage.searchWithString(`flatIds:"caDSR C18059"`, 1);
        });
    });

    test(`cde remove identifier`, async ({ page, navigationMenu, identifierSection }) => {
        const cdeName = 'Malignant Neoplasm Surgical Margin Distance Value';
        await navigationMenu.gotoCdeByName(cdeName);
        await identifierSection.removeIdentifierByIndex(1);

        await expect(page.locator('cde-identifiers')).not.toContainText('caDSR');
        await expect(page.locator('cde-identifiers')).not.toContainText('2682865');
    });

    test(`form remove identifier`, async ({
        page,
        materialPage,
        saveModal,
        navigationMenu,
        identifierSection,
        historySection,
        auditTab,
        itemLogAuditPage,
    }) => {
        const identifier1 = { source: 'PhenX', id: 'MyId1', version: 'MyVersion1' };
        const identifier2 = { source: 'caDSR', id: 'MyId2' };
        const versionInfo: Version = {
            newVersion: '2',
            changeNote: '[form remove identifier]',
        };
        const formName = `Vision Deficit Report`;
        await navigationMenu.gotoFormByName(formName, true);

        await test.step(`add identifiers, then save`, async () => {
            await identifierSection.addIdentifier(identifier1);
            await identifierSection.addIdentifier(identifier2);

            await identifierSection.removeIdentifierByIndex(1);

            await saveModal.publishNewVersionByType('form', versionInfo);
            await test.step(`Verify version number`, async () => {
                await identifierSection.verifyVersion(versionInfo);
            });
        });

        await test.step(`verify identifiers`, async () => {
            await expect(page.getByText('MyId1')).toBeHidden();
            await expect(page.getByText('MyId2')).toBeVisible();
        });

        await test.step(`Verify history`, async () => {
            await test.step(`Verify compare`, async () => {
                await historySection.selectHistoryTableRowsToCompare(0, 1);
                await expect(materialPage.matDialog().getByText(identifier2.id)).toBeVisible();
                await materialPage.closeMatDialog();
            });

            const versionHistories = [versionInfo];
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
                await expect(newPage.getByText(identifier2.id).first()).toBeVisible();
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
            await expect(detailLocator.getByText(identifier2.id).first()).toBeVisible();
        });
    });
});
