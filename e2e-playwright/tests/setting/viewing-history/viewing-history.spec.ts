import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';

test(`Viewing history`, async ({ page, materialPage, navigationMenu, settingMenu }) => {
    const cdes = [
        `Patient Eligibility Ind-2`,
        `Specimen Inflammation Change Type`,
        `Person Mother Onset Menopause Age Value`,
        `Definition Type Definition Type String`,
        `Service Item Display Name java.lang.String`,
        `Apgar Score Created By java.lang.Long`,
        `Target Lesion Sum Short Longest Dimension Measurement`,
        `Form Element End Date`,
        `Treatment Text Other Text`,
        `Specimen Block Received Count`,
        `Malignant Neoplasm Metastatic Involvement Anatomic`,
    ];
    const forms = [
        `Answer Value Display Profile Test`,
        `Traumatic Brain Injury - Adverse Events`,
        `Patient Health Questionnaire 2 item (PHQ-2) [Reported]`,
    ];
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.viewingHistoryUser);
    });

    await test.step(`Verify no viewing history`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.viewingHistoryMenu().click();
        await expect(page.getByText(`There are no CDE viewing History`)).toBeVisible();
        await expect(page.getByText(`There are no Form viewing History`)).toBeVisible();
    });

    await test.step(`View CDEs`, async () => {
        for (const cde of cdes) {
            await navigationMenu.gotoCdeByName(cde);
        }
    });
    await test.step(`View Forms`, async () => {
        for (const form of forms) {
            await navigationMenu.gotoFormByName(form);
        }
    });

    await test.step(`Verify viewing history, at most 10 histories and sorted by most recent view first`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.viewingHistoryMenu().click();
        await expect(materialPage.matExpansionPanelHeader()).toContainText(
            cdes.reverse().slice(0, 10).concat(forms.reverse())
        );
    });
});
