import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';

test(`Add UMLS permissible value`, async ({
    page,
    saveModal,
    navigationMenu,
    materialPage,
    cdePage,
    permissibleValueSection,
}) => {
    const cdeName = 'Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator';
    const versionInfo: Version = {
        newVersion: '',
        changeNote: '[cde add uml pv]',
    };

    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Permissible Value' })).toBeVisible();
        await page.getByRole('heading', { name: 'Permissible Value' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Import PV from UMLS`, async () => {
        await permissibleValueSection.addPermissibleValueButton().click();
        await materialPage.matDialog().waitFor();
        await permissibleValueSection.valueMeaningNameInput().fill('Female');
        await page.getByRole('button', { name: 'C0086287 : Females' }).click();
        await page.getByRole('button', { name: 'Save' }).click();
    });

    await test.step(`Verify Code from NCI`, async () => {
        await permissibleValueSection.permissibleValueSynonymsCheckbox('NCI').check();
        const tableRows = permissibleValueSection.permissibleValueTableRows();
        await expect(permissibleValueSection.permissibleValueSynonymsTds(tableRows.last(), 'NCI')).toHaveText([
            'A7570536 | A10805032',
            'Female | Female Gender',
        ]);
    });

    await test.step(`Verify Code from LOINC`, async () => {
        await permissibleValueSection.permissibleValueSynonymsCheckbox('LOINC').check();
        const tableRows = permissibleValueSection.permissibleValueTableRows();
        await expect(permissibleValueSection.permissibleValueSynonymsTds(tableRows.last(), 'LOINC')).toHaveText([
            'A24095561',
            'Female',
        ]);
    });

    await test.step(`Verify Code from SNOMEDCT`, async () => {
        await permissibleValueSection.permissibleValueSynonymsCheckbox('SNOMEDCT').check();
        const tableRows = permissibleValueSection.permissibleValueTableRows();
        await expect(tableRows.last()).toContainText('A3453356');
        await expect(tableRows.last()).toContainText('A2881557');
        await expect(tableRows.last()).toContainText('Female');
        await expect(tableRows.last()).toContainText('Female structure');
    });

    await test.step(`Publish CDE to new version`, async () => {
        await saveModal.publishNewVersionByType('cde', versionInfo);
    });

    await test.step(`Logout and Verify NCI and UMLS code`, async () => {
        await navigationMenu.logout();
        await navigationMenu.gotoCdeByName(cdeName);

        await permissibleValueSection.permissibleValueSynonymsCheckbox('NCI').check();
        const nciTableRows = permissibleValueSection.permissibleValueTableRows();
        await expect(permissibleValueSection.permissibleValueSynonymsTds(nciTableRows.last(), 'NCI')).toHaveText([
            'A7570536 | A10805032',
            'Female | Female Gender',
        ]);

        await permissibleValueSection.permissibleValueSynonymsCheckbox('UMLS').check();
        const umlsTableRows = permissibleValueSection.permissibleValueTableRows();
        await expect(permissibleValueSection.permissibleValueSynonymsTds(umlsTableRows.last(), 'UMLS')).toHaveText([
            'C0086287',
            'Females',
        ]);
    });
});
