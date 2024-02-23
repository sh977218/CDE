import { readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

test.describe(`Search CDE export`, async () => {
    test.beforeEach(async ({ page }) => {
        await page.route(`server/de/searchExport`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
    });
    test.describe.configure({ mode: 'serial' });
    test.describe(`csv export`, async () => {
        test.beforeEach(async ({ navigationMenu, searchPage }) => {
            await navigationMenu.gotoCdeSearch();
            await searchPage.browseOrganization('NINDS');
        });
        test(`default setting`, async ({ page, materialPage }) => {
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await page.locator('#csvExport').click();
            await materialPage.checkAlert(`Search results downloaded as CSV.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers`,
                    `"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - Hoehn and Yahr stage score","HOEHN AND YAHR STAGE","Value List","0; 1; 2; 3; 4; 5","6","NINDS","NINDS","Qualified","NINDS: C10025 v3; NINDS Variable Name: MDSUPDRSHoehnYahrStageScore",`,
                    `"Unified Parkinson's Disease Rating Scale (UPDRS) - symptomatic orthostasis indicator","Does the patient have symptomatic orthostasis?","Value List","0; 1","2","NINDS","NINDS","Qualified","NINDS: C09927 v3; NINDS Variable Name: UPDRSSymOrtInd",`,
                    `1; 0.9; 0.8; 0.7; 0.6; 0.5; 0.4; 0.3; 0.2; 0.1; 0`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`custom setting`, async ({ page, materialPage }) => {
            await materialPage.loadTableViewSettingsForExport();
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await page.locator('#csvExport').click();
            await materialPage.checkAlert(`Search results downloaded as CSV.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `Name, Question Texts, Other Names, Value Type, Permissible Values, Code Names, Nb of Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, NINDS Variable Name, Source, Updated`,
                    `"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - Hoehn and Yahr stage score","HOEHN AND YAHR STAGE","Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - Hoehn and Yahr stage score","Value List","0; 1; 2; 3; 4; 5","Asymptomatic; Unilateral involvement only; Bilateral involvement without impairment of balance; Mild to moderate involvement, some postural instability but physically independent, needs assistance to recover from pull test; Severe disability, still able to walk or stand unassisted; Wheelchair bound or bedridden unless aided","6","","NINDS","NINDS","Qualified","Published","MDSUPDRSHoehnYahrStageScore","NINDS","",`,
                    `"Unified Parkinson's Disease Rating Scale (UPDRS) -  neck rigidity scale","Rigidity Judged on passive movement of major joints with patient relaxed in sitting position. Cogwheeling to be ignored.","Unified Parkinson's Disease Rating Scale (UPDRS) -  neck rigidity scale","Value List","0; 1; 2; 3; 4","Absent; Slight or detectable only when activated by mirror or other movements; Mild to moderate; Marked, but full range of motion easily achieved; Severe, range of motion achieved with difficulty","5","","NINDS","NINDS","Qualified","Published","UPDRSNckRigScale","NINDS","",`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });
    });

    test(`json export`, async ({ page, materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.browseOrganization('NINDS');
        await searchPage.searchWithString(`"Unified Parkinson's"`);
        await page.locator('#export').click();

        const downloadPromise = page.waitForEvent('download');
        await page.locator('#jsonExport').click();
        await materialPage.checkAlert(`Search results downloaded as JSON.`);
        const download = await downloadPromise;
        await download.saveAs(download.suggestedFilename());
        const downloadedFile = await download.path();
        if (downloadedFile) {
            const expectedContents = [
                `\"tinyId\":\"03UmDCNQ4x7\",\"imported\":\"2015-09-21T18:20:26.298Z\",\"source\":\"NINDS\",\"version\":\"3\",`,
                `\"referenceDocuments\":[],\"attachments\":[]`,
                `\"archived\":false`,
            ];

            const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
            for (const expectedContent of expectedContents) {
                expect(fileContent).toContain(expectedContent);
            }
        }
    });

    test(`xml export`, async ({ page, materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.browseOrganization('CTEP');
        await page.locator('#export').click();
        const downloadPromise = page.waitForEvent('download');
        await page.locator('#xmlExport').click();
        await materialPage.checkAlert(`Search results downloaded as XML.`);
        const download = await downloadPromise;
        await download.saveAs(download.suggestedFilename());
        const downloadedFile = await download.path();
        if (downloadedFile) {
            const expectedContents = [
                `<tags>Health</tags>`,
                `<name>Common Toxicity Criteria Adverse Event Iron Excess Grade</name>`,
                `<datatype>Value List</datatype>`,
                `<registrationStatus>Qualified</registrationStatus><administrativeStatus>Published</administrativeStatus></registrationState>`,
            ];
            const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
            for (const expectedContent of expectedContents) {
                expect(fileContent).toContain(expectedContent);
            }
        }
    });
});
