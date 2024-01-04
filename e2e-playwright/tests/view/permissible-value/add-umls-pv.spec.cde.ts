import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import cdeTinyId from '../../../data/cde-tinyId';
import user from '../../../data/user';

test(`Add UMLS permissible value`, async ({ page, saveModal, navigationMenu, materialPage, cdePage, basePage }) => {
    const cdeName = 'Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator';

    await test.step(`Navigate to CDE and login`, async () => {
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await expect(basePage.getHeading('Permissible Value')).toBeVisible();
        await basePage.getHeading('Permissible Value').scrollIntoViewIfNeeded();
    });

    await test.step(`Import PV from UMLS`, async () => {
        await cdePage.addPermissibleValueButton().click();
        await materialPage.matDialog().waitFor({ state: 'visible' });
        await cdePage.valueMeaningNameInput().fill('Female');
        await page.getByRole('link', { name: 'C0086287 : Females' }).click();
        await page.getByRole('button', { name: 'Save' }).click();
    });

    await test.step(`Verify Code from NCI`, async () => {
        await cdePage.permissibleValueSynonymsCheckbox('NCI').check();
        const tableRows = cdePage.permissibleValueTableRows();
        await expect(cdePage.permissibleValueSynonymsTds(tableRows.last(), 'NCI')).toHaveText([
            'A7570536 | A10805032',
            'Female | Female Gender',
        ]);
    });

    await test.step(`Verify Code from LOINC`, async () => {
        await cdePage.permissibleValueSynonymsCheckbox('LOINC').check();
        const tableRows = cdePage.permissibleValueTableRows();
        await expect(cdePage.permissibleValueSynonymsTds(tableRows.last(), 'LOINC')).toHaveText([
            'A24095561',
            'Female',
        ]);
    });

    await test.step(`Verify Code from SNOMEDCT`, async () => {
        await cdePage.permissibleValueSynonymsCheckbox('SNOMEDCT').check();
        const tableRows = cdePage.permissibleValueTableRows();
        await expect(cdePage.permissibleValueSynonymsTds(tableRows.last(), 'SNOMEDCT')).toHaveText([
            'A3453356 | A2881557',
            'Female structure | Female',
        ]);
    });

    await test.step(`Publish CDE to new version`, async () => {
        await cdePage.publishDraft().click();
        await saveModal.newVersion();
        await materialPage.checkAlert('Data Element saved.');
    });

    await test.step(`Logout and Verify NCI and UMLS code`, async () => {
        await navigationMenu.logout();
        await cdePage.goToCde(cdeTinyId[cdeName]);

        await cdePage.permissibleValueSynonymsCheckbox('NCI').check();
        const nciTableRows = cdePage.permissibleValueTableRows();
        await expect(cdePage.permissibleValueSynonymsTds(nciTableRows.last(), 'NCI')).toHaveText([
            'A7570536 | A10805032',
            'Female | Female Gender',
        ]);

        await cdePage.permissibleValueSynonymsCheckbox('UMLS').check();
        const umlsTableRows = cdePage.permissibleValueTableRows();
        await expect(cdePage.permissibleValueSynonymsTds(umlsTableRows.last(), 'UMLS')).toHaveText([
            'C0086287',
            'Females',
        ]);
    });
});
