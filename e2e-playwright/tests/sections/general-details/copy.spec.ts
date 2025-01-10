import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { CdeTinyIds } from '../../../data/cde-tinyId';
import { FormTinyIds } from '../../../data/form-tinyId';

test.describe(`Copy`, async () => {
    test(`curator can copy`, async ({ page, navigationMenu }) => {
        const cdeName = 'Brief Pain Inventory (BPI) - pain general activity interference scale';
        const formName = 'Frontal Systems Behavioral Scale (FrSBe)';
        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
    });

    test(`regUser can't copy`, async ({ page, navigationMenu }) => {
        const cdeName = 'Ethnic Group Category Text';
        const formName = 'Patient Health Questionnaire-2 (PHQ-2) More Questions';
        await navigationMenu.login(Accounts.regularUser);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeHidden();
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('button', { name: 'Copy' })).toBeHidden();
    });

    test(`Copy CDE`, async ({
        page,
        materialPage,
        navigationMenu,
        cdePage,
        identifierSection,
        submissionInformationSection,
    }) => {
        const cdeName = 'Medication affecting cardiovascular function type exam day indicator';
        const cdeIds = ['C06291', 'MedAffCardFunTypExmDayInd'];
        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoCdeByName(cdeName);
        await page.getByRole('button', { name: 'Copy' }).click();
        await materialPage.matDialog().waitFor();
        await materialPage.matDialog().getByRole('button', { name: 'Submit' }).click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await expect(submissionInformationSection.registrationStatus()).toHaveText('Incomplete');
        await expect(cdePage.cdeTitle()).toContainText(`Copy of: ${cdeName}`);
        await expect(submissionInformationSection.administrativeNote()).toHaveText(`Copy of: ${CdeTinyIds[cdeName]}`);

        await test.step(`Verify id are not copied, how about sources? @TODO`, async () => {
            for (const cdeId of cdeIds) {
                await expect(
                    identifierSection.identifierTable().locator('tbody tr td:nth-child(2)', { hasText: cdeId })
                ).toBeHidden();
            }
        });
    });

    test(`Copy Form`, async ({
        page,
        materialPage,
        navigationMenu,
        formPage,
        generateDetailsSection,
        identifierSection,
        submissionInformationSection,
    }) => {
        const formName = 'Type, Place, Cause and Mechanism of Injury';
        const formSource = 'Name:LOINC';
        const formId = '1234567';
        await navigationMenu.login(Accounts.ninds);
        await navigationMenu.gotoFormByName(formName, true); // multiple forms with same name
        await page.getByRole('button', { name: 'Copy' }).click();
        await materialPage.matDialog().waitFor();
        await materialPage.matDialog().getByRole('button', { name: 'Submit' }).click();
        await materialPage.matDialog().waitFor({ state: 'hidden' });
        await expect(submissionInformationSection.registrationStatus()).toHaveText('Incomplete');
        await expect(formPage.formTitle()).toContainText(`Copy of: ${formName}`);
        await expect(submissionInformationSection.administrativeNote()).toHaveText(`Copy of: ${FormTinyIds[formName]}`);

        await test.step(`Verify id and source are not copied`, async () => {
            await expect(
                identifierSection.identifierTable().locator('tbody tr td:nth-child(2)', { hasText: formId })
            ).toBeHidden();
            await expect(generateDetailsSection.sources()).not.toContainText(formSource);
        });
    });
});
