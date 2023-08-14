import test from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import cdeTinyId from '../../../data/cde-tinyId';
import user from '../../../data/user';

test.describe(`Codes with synonyms`, async () => {
    test.beforeEach(async ({basePage, cdePage}) => {
        const cdeName = 'Race Category Text';
        await cdePage.goToCde(cdeTinyId[cdeName]);
        await expect(basePage.getHeading('Permissible Value')).toBeVisible();
        await basePage.getHeading('Permissible Value').scrollIntoViewIfNeeded();
    })

    test.describe(`Not loggedIn`, async () => {
        test(`Code from LOINC (Disabled)`, async ({basePage, cdePage, navigationMenu}) => {
            test.expect(await cdePage.permissibleValueSynonymsCheckbox('LOINC').isEnabled()).toBeFalsy();
        });

        test(`Code from SNOMEDCT (Disabled)`, async ({basePage, cdePage, navigationMenu}) => {
            test.expect(await cdePage.permissibleValueSynonymsCheckbox('SNOMEDCT').isEnabled()).toBeFalsy();
        });

        test(`Code from NCI`, async ({basePage, cdePage, navigationMenu}) => {
            await cdePage.permissibleValueSynonymsCheckbox('NCI').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'NCI'))
                .toHaveText(['C41259', 'American Indian or Alaska Native']);
        });
        test(`Code from UMLS`, async ({basePage, cdePage, navigationMenu}) => {
            await cdePage.permissibleValueSynonymsCheckbox('UMLS').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'UMLS'))
                .toHaveText(['C1515945', 'American Indian or Alaska Native']);
        });

    })
    test.describe(`LoggedIn`, async () => {
        test.beforeEach(async ({navigationMenu}) => {
            await navigationMenu.login(user.nlm.username, user.nlm.password);
        })
        test(`Code from LOINC`, async ({basePage, cdePage, navigationMenu}) => {
            await cdePage.permissibleValueSynonymsCheckbox('LOINC').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'LOINC'))
                .toHaveText(['LA6155-1', 'American Indian or Alaska Native']);
        });
        test(`Code from SNOMEDCT`, async ({basePage, cdePage, navigationMenu}) => {
            await cdePage.permissibleValueSynonymsCheckbox('SNOMEDCT').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'SNOMEDCT'))
                .toHaveText(['413490006', 'American Indian or Alaska native']);
        });

    })

});
