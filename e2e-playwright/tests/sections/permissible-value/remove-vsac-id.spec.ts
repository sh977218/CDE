import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';
import { Version } from '../../../model/type';

test(`VSAC Id`, async ({ saveModal, navigationMenu, permissibleValueSection }) => {
    const cdeName = 'Left Colon Excision Ind-2';

    await test.step(`Login and go to CDE`, async () => {
        await navigationMenu.login(Accounts.ctepEditor);
        await navigationMenu.gotoCdeByName(cdeName);
    });

    await test.step(`add vsac id`, async () => {
        const versionInfo: Version = {
            newVersion: '2',
            changeNote: '[cde add vsac id]',
        };
        await permissibleValueSection.updateOid('2.16.840.1.114222.4.11.837');
        await expect(permissibleValueSection.oidResultTable().locator('tbody tr')).toContainText(['2135-2', '2186-5']);
        await saveModal.newVersionByType('cde', versionInfo);
    });

    await test.step(`Go to CDE`, async () => {
        await navigationMenu.gotoCdeByName(cdeName);
    });

    await test.step(`remove vsac id`, async () => {
        const versionInfo: Version = {
            newVersion: '3',
            changeNote: '[cde remove vsac id]',
        };
        await permissibleValueSection.removeOidMappingButton().click();
        await expect(permissibleValueSection.oidResultTable()).toBeHidden();
        await saveModal.newVersionByType('cde', versionInfo);
    });
});
