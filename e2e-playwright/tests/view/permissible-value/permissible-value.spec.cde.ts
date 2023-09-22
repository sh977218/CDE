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
        test(`Code from LOINC (Disabled)`, async ({cdePage}) => {
            test.expect(await cdePage.permissibleValueSynonymsCheckbox('LOINC').isEnabled()).toBeFalsy();
        });

        test(`Code from SNOMEDCT (Disabled)`, async ({cdePage}) => {
            test.expect(await cdePage.permissibleValueSynonymsCheckbox('SNOMEDCT').isEnabled()).toBeFalsy();
        });

        test(`Code from NCI`, async ({cdePage}) => {
            await cdePage.permissibleValueSynonymsCheckbox('NCI').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'NCI'))
                .toHaveText(['C41259', 'American Indian or Alaska Native'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(1), 'NCI'))
                .toHaveText(['C41260', 'Asian'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(2), 'NCI'))
                .toHaveText(['C41261', 'White'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(3), 'NCI'))
                .toHaveText(['C16352', 'Black or African American'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(4), 'NCI'))
                .toHaveText(['C43234', 'Not Reported'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(5), 'NCI'))
                .toHaveText(['C17998', 'Unknown'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(6), 'NCI'))
                .toHaveText(['C41219', 'Native Hawaiian or Other Pacific Islander'], {timeout: 10000});
        });
        test(`Code from UMLS`, async ({cdePage}) => {
            await cdePage.permissibleValueSynonymsCheckbox('UMLS').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'UMLS'))
                .toHaveText(['C1515945', 'American Indian or Alaska Native'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(1), 'UMLS'))
                .toHaveText(['C0078988', 'Asians'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(2), 'UMLS'))
                .toHaveText(['C0007457', 'Caucasian'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(3), 'UMLS'))
                .toHaveText(['C5441680', 'Black or African American'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(4), 'UMLS'))
                .toHaveText(['C1706613', 'Not Stated'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(5), 'UMLS'))
                .toHaveText(['C0439673', 'Unknown'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(6), 'UMLS'))
                .toHaveText(['C1513907', 'Native Hawaiian or Other Pacific Islander'], {timeout: 10000});
        });

    })
    test.describe(`LoggedIn`, async () => {
        test.beforeEach(async ({navigationMenu}) => {
            await navigationMenu.login(user.nlm.username, user.nlm.password);
        })
        test(`Code from LOINC`, async ({cdePage}) => {
            await cdePage.permissibleValueSynonymsCheckbox('LOINC').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'LOINC'))
                .toHaveText(['LA6155-1 | LA16817-1', 'American Indian or Alaska Native | Native american'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(1), 'LOINC'))
                .toHaveText(['LA6156-9', 'Asian'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(3), 'LOINC'))
                .toHaveText(['LA10610-6 | LA6162-7 | LA14042-8', 'Black or African American | Black or African-American | Black/African American'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(5), 'LOINC'))
                .toHaveText(['LA15677-0 | LA4708-9 | LA14748-0 | LA14945-2 | LA4489-6', '? = Unknown | NOS, unknown | Not known | Unk | Unknown'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(6), 'LOINC'))
                .toHaveText(['LA10611-4', 'Native Hawaiian or Other Pacific Islander'], {timeout: 10000});
        });
        test(`Code from SNOMEDCT`, async ({cdePage}) => {
            await cdePage.permissibleValueSynonymsCheckbox('SNOMEDCT').check();
            const tableRows = cdePage.permissibleValueTableRows();
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.first(), 'SNOMEDCT'))
                .toHaveText(['413490006', 'American Indian or Alaska native'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(1), 'SNOMEDCT'))
                .toHaveText(['413582008 | 414978006', 'Asian race | Oriental'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(2), 'SNOMEDCT'))
                .toHaveText(['413773004', 'Caucasian'], {timeout: 10000});
            await test.expect(cdePage.permissibleValueSynonymsTds(tableRows.nth(5), 'SNOMEDCT'))
                .toHaveText(['261665006', 'Unknown'], {timeout: 10000});
        });

    })

});
