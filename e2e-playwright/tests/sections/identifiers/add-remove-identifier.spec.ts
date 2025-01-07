import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';
import { expect } from '@playwright/test';

test.describe.configure({ retries: 0 });
test.describe(`add remove identifier`, async () => {
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
        await navigationMenu.login(Accounts.nlm);
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
        await navigationMenu.login(Accounts.ctepEditor);
        await navigationMenu.gotoCdeByName(cdeName);

        await identifierSection.removeIdentifierByIndex(1);

        await expect(page.locator('cde-identifiers')).not.toContainText('caDSR');
        await expect(page.locator('cde-identifiers')).not.toContainText('2682865');
    });

    test(`form remove identifier`, async ({
        page,
        searchSettingPage,
        saveModal,
        settingMenu,
        navigationMenu,
        identifierSection,
    }) => {
        const versionInfo: Version = {
            newVersion: '',
            changeNote: '[form remove identifier]',
        };

        const formName = `Vision Deficit Report`;
        await navigationMenu.login(Accounts.nlm);

        await navigationMenu.gotoSettings();
        await settingMenu.searchSettingsMenu().click();
        await searchSettingPage.setViewPublishAndDraft();

        await navigationMenu.gotoFormByName(formName);
        await identifierSection.addIdentifier({ source: 'PhenX', id: 'MyId1', version: 'MyVersion1' });
        await identifierSection.addIdentifier({ source: 'caDSR', id: 'MyId2' });

        await identifierSection.removeIdentifierByIndex(1);

        await saveModal.publishNewVersionByType('form', versionInfo);

        await expect(page.getByText('MyId1')).toBeHidden();
        await expect(page.getByText('MyId2')).toBeVisible();
    });
});
