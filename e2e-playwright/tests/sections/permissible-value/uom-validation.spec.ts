import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { DisplayProfile } from '../../../model/type';
import { Accounts } from '../../../data/user';

test(`Validate UOM`, async ({
    page,
    navigationMenu,
    materialPage,
    saveModal,
    formPage,
    previewSection,
    formDescription,
    displayProfileSection,
}) => {
    const formName = 'DNA Elements - Participant/Subject Information';

    await test.step(`Navigate to Form description and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await previewSection.editFormDescriptionButton().click();
    });

    await test.step(`validate uom error exist`, async () => {
        await expect(
            page.getByText('UCUM/inch (Error: Unit inch found but needs to be replaced with [in_i] )')
        ).toBeVisible();
        await expect(
            page.getByText('UCUM/meter (Error: Unit meter found but needs to be replaced with m )')
        ).toBeVisible();
        await expect(
            page.getByText('UCUM/inches (Error: Unit is not found. Did you mean [in_i] (inch)? )')
        ).toBeVisible();
        await formDescription.startEditQuestionById('question_0-3');
        await formDescription.questionEditAddUom('question_0-3', 'UCUM', 'kilogram');
        await formDescription.questionEditAddUom('question_0-3', 'Other', 'Kilo');
        await page
            .locator(
                `//*[@id='question_0-3']//*[contains(@class,'questionUom')]//span[contains(@class,'badge badge-info') and contains(normalize-space(.),'inches')]/mat-icon`
            )
            .click();
        await formDescription.saveEditQuestionById('question_0-3');
        await expect(page.getByText('inches')).toBeHidden();
        await expect(
            page.locator(`//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[normalize-space()='UCUM/kg']`)
        ).toBeVisible();
        await expect(
            page.locator(`//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[normalize-space()='Kilo']`)
        ).toBeVisible();
        await formDescription.saveFormEdit();
    });

    await test.step(`Add UOM`, async () => {
        await page
            .locator(`//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']`)
            .clear();
        await page
            .locator(`//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']`)
            .fill('1.25');

        await page
            .locator(
                `//div[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3']//input[@name='0-3_uom_0']`
            )
            .click();
        await expect(
            page.locator(`//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']`)
        ).toHaveValue('1.25');
        await page
            .locator(
                `//div[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3']//input[@name='0-3_uom_1']`
            )
            .click();
    });

    await test.step(`Create display profiles`, async () => {
        await page.getByRole('heading', { name: 'Display Profiles' }).scrollIntoViewIfNeeded();
        const uomDisplayProfile: DisplayProfile = {
            profileName: 'Uom',
            styleName: 'Print (Follow-up style)',
            numberOfColumn: 1,
            answerDropdownLimit: 0,
            matrix: true,
            displayValues: true,
            instructions: true,
            numbering: true,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };
        await displayProfileSection.addDisplayProfile(uomDisplayProfile);
        await materialPage.checkAlert('Saved');
        const noUomDisplayProfile: DisplayProfile = {
            profileName: 'No Uom',
            styleName: 'Print (Follow-up style)',
            numberOfColumn: 1,
            answerDropdownLimit: 0,
            matrix: true,
            displayValues: true,
            instructions: true,
            numbering: true,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };
        await displayProfileSection.addDisplayProfile(noUomDisplayProfile);
    });

    await test.step(`Edit first uom display profiles, select it and verify 'international inch'`, async () => {
        const uomDisplayProfileLocator = displayProfileSection.displayProfileContainer().first();
        await uomDisplayProfileLocator.getByRole('button', { name: 'Edit' }).click();
        await uomDisplayProfileLocator
            .locator(`[id='alias-UCUM-inch']`)
            .locator(`select`)
            .selectOption('international inch');
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
        await previewSection.selectDisplayProfileByName('Uom');
        await expect(previewSection.previewDiv().getByText('international inch')).toBeVisible();
    });

    await test.step(`Select 'No Uom' profile and verify no 'international inch'`, async () => {
        await previewSection.selectDisplayProfileByName('No Uom');
        await expect(previewSection.previewDiv().getByText('international inch')).toBeHidden();
    });

    await test.step(`Cannot publish while UOM error exists`, async () => {
        await expect(page.getByText('The following errors need to be corrected in order to Publish')).toBeVisible();
        await expect(
            page.getByText(
                'Unit of Measure error on question "If Yes, what are the number of CAG repeats on the larger allele".'
            )
        ).toBeVisible();
        await saveModal.publishDraftButton().click();
        await materialPage.checkAlert('Please fix all errors before publishing');
        await saveModal.deleteDraft();
    });

    await test.step(`Click error link and navigate to error section`, async () => {
        await page
            .getByRole('link', { name: 'If Yes, what are the number of CAG repeats on the larger allele' })
            .click();
        await expect(page).toHaveURL(/#question_0-3/);
    });
});
