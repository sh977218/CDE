import { statSync, readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { FormTinyIds } from '../../data/form-tinyId';

test.describe(`Form view export`, async () => {
    test.beforeEach(async ({ page }) => {
        await page.route(`server/form/searchExport`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
    });
    test.describe(`csv export`, async () => {
        test(`form CDE export`, async ({ page, materialPage, navigationMenu }) => {
            const formName = `Form In Form Num Questions`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('CDE Dictionary CSV file').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    '"Traumatic brain injury symptom other text","Other, Specify:","Text","","NINDS","NINDS","Qualified","NINDS: C18400 v3; NINDS Variable Name: TBISympOthrTxt",',
                    '"Person Gender Text Type","Patient gender; Gender; Gender of a Person; Recipient gender:; What is your gender?; Newborn Gender","Value List","Female; Male; Unknown; Unspecified","caBIG","caBIG; DCP; NHLBI; SPOREs; TEST; CCR; CDC/PHIN; ECOG-ACRIN; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCI","Standard","caDSR: 2200604 v3",',
                    '"Insomnia Severity Index (ISI) - worry distress measurement","How worried distressed are you about your current sleep problem?","Value List","0; 1; 2; 3; 4","NINDS","NINDS","Qualified","NINDS: C09382 v3; NINDS Variable Name: ISIWorDistMeasr"',
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`form with linkedForm CDE export long`, async ({ page, materialPage, navigationMenu }) => {
            const formName = `Stroke Types and Subtypes`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('CDE Dictionary CSV file').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `"Baltimore-Washington Cooperative Young Stroke Study (BWCYSS) - standard sub type","","Text","","NINDS","NINDS","Qualified","NINDS: C14228 v3; NINDS Variable Name: BWCYSSStandardSubTyp",`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`form with linkedForm CDE export short`, async ({ page, materialPage, navigationMenu }) => {
            const formName = `Surgical and Procedural Interventions`;
            await navigationMenu.login(Accounts.formLinkedFormsUser);
            await navigationMenu.gotoFormByTinyId(FormTinyIds[formName]);
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('CDE Dictionary CSV file').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `"Surgical or therapeutic procedure other text","Other, specify","Text","","NINDS","NINDS","Qualified","NINDS: C18765 v1; NINDS Variable Name: SurgTherapProcedurOTH"`,
                    `myoQ8JBHFe`,
                    `my57Uyrrtg`,
                    `XkYXUyHStg`,
                    `mkDmUyBBFe`,
                    `7k0Q1rHYe`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });
    });

    test.describe(`json export`, async () => {
        test(`as file`, async ({ page, materialPage, navigationMenu }) => {
            const formName = `Adverse Event Tracking Log`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoFormByName(formName);
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('NIH/CDE Schema JSON file Schema').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    '{"title":"CRF","uri":"https://commondataelements.ninds.nih.gov/Doc/EPI/F1126_Adverse_Event_Tracking_Log.docx"}',
                    '"permissibleValue":"Yes"',
                    '"valueMeaningName":"Yes"',
                    '"registrationState":{"registrationStatus":"Qualified","administrativeStatus":"Published"}',
                    '"stewardOrg":{"name":"NINDS"}',
                    '"designations":[{"tags":[],"designation":"Adverse Event Tracking Log"',
                    'isBundle',
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`as new tab`, async ({ page, materialPage, navigationMenu, searchPreferencesPage }) => {
            const formName = `Adverse Event Tracking Log`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.searchPreferencesButton().click();
            await searchPreferencesPage.downloadAsTab().click();
            await searchPreferencesPage.saveButton().click();
            await materialPage.checkAlert(`Settings saved!`);

            await navigationMenu.gotoFormByName(formName);
            await page.locator('#export').click();
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                materialPage.matMenuItem('NIH/CDE Schema JSON preview Schema').click(),
            ]);
            const expectedContents = [
                '{"title":"CRF","uri":"https://commondataelements.ninds.nih.gov/Doc/EPI/F1126_Adverse_Event_Tracking_Log.docx"}',
                '"permissibleValue":"Yes"',
                '"valueMeaningName":"Yes"',
                '"registrationState":{"registrationStatus":"Qualified","administrativeStatus":"Published"}',
                '"stewardOrg":{"name":"NINDS"}',
                '"designations":[{"tags":[],"designation":"Adverse Event Tracking Log"',
                'isBundle',
            ];
            for (const expectedContent of expectedContents) {
                await expect(newPage.getByText(expectedContent)).toBeVisible();
            }
        });
    });

    test(`xml export`, async ({ page, materialPage, navigationMenu, searchPage }) => {
        const formName = `Parenchymal Imaging`;
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
        await page.locator('#export').click();
        const downloadPromise = page.waitForEvent('download');
        await materialPage.matMenuItem(`NIH/CDE Schema XML file`).click();
        await materialPage.checkAlert(`Export downloaded.`);
        const download = await downloadPromise;
        await download.saveAs(download.suggestedFilename());
        const downloadedFile = await download.path();
        if (downloadedFile) {
            const expectedContents = [
                `<designations>`,
                `<designation>Parenchymal Imaging</designation>`,
                `</designations>`,
                `<definition>Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage. (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)`,
                `</definition>`,
            ];

            const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
            for (const expectedContent of expectedContents) {
                expect(fileContent).toContain(expectedContent);
            }
        }
    });

    test(`RedCap Zip export `, async ({ page, materialPage, navigationMenu, searchPage }) => {
        const formName = `Frontal Behavioral Inventory (FBI)`;
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoFormByName(formName);
        await page.locator('#export').click();
        const downloadPromise = page.waitForEvent('download');
        await materialPage.matMenuItem('REDCap CSV archive Information').click();
        await materialPage.checkAlert(`Export downloaded.`);
        const download = await downloadPromise;
        await download.saveAs(download.suggestedFilename());
        const downloadedFile = await download.path();
        if (downloadedFile) {
            const fileContent = statSync(downloadedFile);
            expect(fileContent.size).toBe(9285);
        }
    });
});
