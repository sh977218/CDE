import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';
import { expect } from '@playwright/test';

test.describe.configure({ retries: 0 });
test(`form remove identifier`, async ({ page, saveModal, navigationMenu, identifierSection }) => {
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[form remove identifier]',
    };

    const formName = `Vision Deficit Report`;
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoFormByName(formName);
    await identifierSection.addIdentifier({ source: 'PhenX', id: 'MyId1', version: 'MyVersion1' });
    await identifierSection.addIdentifier({ source: 'caDSR', id: 'MyId2' });

    await identifierSection.removeIdentifierByIndex(1);

    await saveModal.newVersionByType('form', versionInfo);

    await expect(page.getByText('MyId1')).toBeHidden();
    await expect(page.getByText('MyId2')).toBeVisible();
});
