import { readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Board export`, async () => {
    test.describe(`private board`, async () => {
        test.beforeEach(async ({ customizeTableModal, navigationMenu, myBoardPage }) => {
            await test.step(`Login and go to board`, async () => {
                await navigationMenu.login(Accounts.classifyBoardUser);
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle('My private board').click();
                await customizeTableModal.loadDefaultTableViewSettings();
            });
        });

        test(`csv export`, async ({ page, materialPage }) => {
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await page.locator('#csvExport').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expected = `Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers
"Pathologist name","Name of pathologist who diagnosed the case","Text","","0","NINDS","NINDS","Qualified","NINDS: C12248 v3; NINDS Variable Name: PathologistName",
"Manual muscle testing date and time","Date of Exam","Date","","0","NINDS","NINDS","Qualified","NINDS: C10970 v3; NINDS Variable Name: ManualMuscleTestDate",
"PTSD Checklist Military (PCLM) - Angry outburst indicator","Feeling irritable or having angry outbursts?","Value List","1; 2; 3; 4; 5","5","NINDS","NINDS","Qualified","NINDS: C07405 v3; NINDS Variable Name: PCLMAngryOutburstInd",
`;
                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                expect(fileContent).toBe(expected);
            }
        });

        test(`xml export`, async ({ page, materialPage }) => {
            await page.locator('#export').click();
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                page.locator('#xmlExport').click(),
            ]);
            await expect(
                newPage.getByText(
                    `<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>`
                )
            ).toBeVisible();
        });
    });

    test.describe(`public board`, async () => {
        test.beforeEach(async ({ customizeTableModal, navigationMenu, myBoardPage }) => {
            await test.step(`Login and go to board`, async () => {
                await navigationMenu.login(Accounts.classifyBoardUser);
                await navigationMenu.gotoMyBoard();
                await myBoardPage.boardTitle('My public board').click();
                await customizeTableModal.loadDefaultTableViewSettings();
            });
        });

        test(`csv export`, async ({ page, materialPage }) => {
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await page.locator('#csvExport').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expected = `Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers
"Pathologist name","Name of pathologist who diagnosed the case","Text","","0","NINDS","NINDS","Qualified","NINDS: C12248 v3; NINDS Variable Name: PathologistName",
"Manual muscle testing date and time","Date of Exam","Date","","0","NINDS","NINDS","Qualified","NINDS: C10970 v3; NINDS Variable Name: ManualMuscleTestDate",
"PTSD Checklist Military (PCLM) - Angry outburst indicator","Feeling irritable or having angry outbursts?","Value List","1; 2; 3; 4; 5","5","NINDS","NINDS","Qualified","NINDS: C07405 v3; NINDS Variable Name: PCLMAngryOutburstInd",
`;
                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                expect(fileContent).toBe(expected);
            }
        });

        test(`xml export`, async ({ page, baseURL }) => {
            await page.locator('#export').click();
            const xmlUrl = await page.locator('#xmlExport').getAttribute('href');
            const newPage = await page.context().newPage();
            if (xmlUrl) {
                await newPage.goto(baseURL + xmlUrl);
                await expect(
                    newPage.getByText(
                        `<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>`
                    )
                ).toBeVisible();
            } else {
                throw new Error('xml href is not defined.');
            }
        });
    });
});
