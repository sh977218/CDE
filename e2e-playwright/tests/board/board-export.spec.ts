import { readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Board export`, async ({ page, materialPage, navigationMenu, myBoardPage }) => {
    await navigationMenu.login(Accounts.boardExportUser);
    const boardName = 'Board Export Test';
    await navigationMenu.gotoMyBoard();
    await myBoardPage.boardTitle(boardName).click();
    await materialPage.loadDefaultTableViewSettings();
    await page.locator('#export').click();
    const downloadPromise = page.waitForEvent('download');

    await page.locator('#csvExport').click();
    await materialPage.checkAlert(`Export downloaded.`);
    const download = await downloadPromise;
    await download.saveAs(download.suggestedFilename());

    const downloadedFile = await download.path();
    if (downloadedFile) {
        const expected = `Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers
"PTSD Checklist Military (PCLM) - Happening again indicator","Suddenly acting or feeling as if the stressful experience were happening again (as if you were reliving it)?","Value List","1; 2; 3; 4; 5","5","NINDS","NINDS","Qualified","NINDS: C07394 v3; NINDS Variable Name: PCLMHappeningAgainInd",
"Parkinson's Disease Quality of Life (PDQUALIF) - away from social scale","My Parkinson�s symptoms cause me to stay away from social gatherings","Value List","Strongly Agree; Somewhat Agree; Agree; Somewhat disagree; Strongly Disagree","5","NINDS","NINDS","Qualified","NINDS: C17382 v3; NINDS Variable Name: PDQUALIFAwyFrmSocScale",
`;
        const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
        expect(fileContent).toBe(expected);
    }
});
