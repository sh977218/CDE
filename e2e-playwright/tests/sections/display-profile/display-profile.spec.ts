import { expect } from '@playwright/test';
import test from '../../../fixtures/base-fixtures';
import user from '../../../data/user';
import formTinyId from '../../../data/form-tinyId';
import { DisplayProfile } from '../../../src/model/type';

test.describe(`Display profile`, async () => {
    test(`Form identifiers always visible`, async ({ searchPage, formPage, displayProfileSection, navigationMenu }) => {
        await searchPage.goToSearch('form');
        const formName = 'Multiple Select Display Profile Test';
        await formPage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);

        const displayProfile: DisplayProfile = {
            profileName: 'Multiple Select Display Profile',
            styleName: 'Digital (Dynamic style)',
            numberOfColumn: 6,
            answerDropdownLimit: 3,
            matrix: false,
            displayValues: false,
            instructions: false,
            numbering: false,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };

        await displayProfileSection.addDisplayProfile(displayProfile);
        await displayProfileSection.deleteDisplayProfile(displayProfile.profileName);
    });

    test(`Answer value`, async ({ searchPage, formPage, displayProfileSection, navigationMenu }) => {
        await searchPage.goToSearch('form');
        const formName = 'Answer Value Display Profile Test';
        await formPage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);

        const answerValueDisplayProfile: DisplayProfile = {
            profileName: 'Answer Value Display Profile',
            styleName: 'Digital (Dynamic style)',
            numberOfColumn: 5,
            answerDropdownLimit: 0,
            matrix: false,
            displayValues: true,
            instructions: false,
            numbering: false,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };

        await displayProfileSection.addDisplayProfile(answerValueDisplayProfile);

        await formPage.goToForm(formTinyId[formName]);

        await test.step(`Preview has answer value`, async () => {
            expect(await displayProfileSection.previewAnswerValue().count()).toBeGreaterThanOrEqual(1);
        });
        await test.step(`Display profile has answer value`, async () => {
            expect(await displayProfileSection.displayProfileAnswerValue().count()).toBeGreaterThanOrEqual(1);
        });

        await displayProfileSection.deleteDisplayProfile(answerValueDisplayProfile.profileName);
    });

    test(`Meta device`, async ({ page, searchPage, formPage, displayProfileSection, navigationMenu }) => {
        test.fixme();
        await searchPage.goToSearch('form');
        const formName = 'Metadata Device Display Profile Test';
        await formPage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);

        const metadataDeviceDisplayProfile: DisplayProfile = {
            profileName: 'Metadata Device Display Profile',
            styleName: 'Digital (Dynamic style)',
            numberOfColumn: 5,
            answerDropdownLimit: 0,
            matrix: false,
            displayValues: true,
            instructions: false,
            numbering: false,
            displayInvisibleQuestion: false,
            displayMetadataDevice: true,
        };

        await displayProfileSection.addDisplayProfile(metadataDeviceDisplayProfile);

        await page.waitForTimeout(5000); // Sometimes the checkbox is not saved.
        await formPage.goToForm(formTinyId[formName]);

        await test.step(`Preview has meta device`, async () => {
            expect(await displayProfileSection.previewMetaDeviceAddButton().count()).toBeGreaterThanOrEqual(1);
        });
        await test.step(`Display profile has meta device`, async () => {
            expect(await displayProfileSection.displayProfileMetaDeviceAddButton().count()).toBeGreaterThanOrEqual(1);
        });

        await displayProfileSection.deleteDisplayProfile(metadataDeviceDisplayProfile.profileName);
    });

    test(`Matrix`, async ({ searchPage, formPage, displayProfileSection, navigationMenu }) => {
        await searchPage.goToSearch('form');
        const formName = 'Matrix Display Profile Test';
        await formPage.goToForm(formTinyId[formName]);
        await navigationMenu.login(user.nlm.username, user.nlm.password);

        const matrixDisplayProfile: DisplayProfile = {
            profileName: 'Matrix Display Profile',
            styleName: 'Digital (Dynamic style)',
            numberOfColumn: 5,
            answerDropdownLimit: 0,
            matrix: true,
            displayValues: true,
            instructions: false,
            numbering: false,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };

        await displayProfileSection.addDisplayProfile(matrixDisplayProfile);

        await formPage.goToForm(formTinyId[formName]);

        await test.step(`Preview has meta device`, async () => {
            expect(await displayProfileSection.previewMatrixCheckbox().count()).toBeGreaterThanOrEqual(1);
        });
        await test.step(`Display profile has meta device`, async () => {
            expect(await displayProfileSection.previewMatrixRadio().count()).toBeGreaterThanOrEqual(1);
        });

        await displayProfileSection.deleteDisplayProfile(matrixDisplayProfile.profileName);

        const noMatrixDisplayProfile: DisplayProfile = {
            profileName: 'Matrix Display Profile',
            styleName: 'Digital (Dynamic style)',
            numberOfColumn: 5,
            answerDropdownLimit: 0,
            matrix: false,
            displayValues: true,
            instructions: false,
            numbering: false,
            displayInvisibleQuestion: false,
            displayMetadataDevice: false,
        };

        await displayProfileSection.addDisplayProfile(noMatrixDisplayProfile);

        await formPage.goToForm(formTinyId[formName]);

        await test.step(`Preview has no matrix checkbox`, async () => {
            expect(await displayProfileSection.previewMatrixCheckbox().count()).toBe(0);
        });
        await test.step(`Display profile no matrix radio`, async () => {
            expect(await displayProfileSection.previewMatrixRadio().count()).toBe(0);
        });

        await displayProfileSection.deleteDisplayProfile(noMatrixDisplayProfile.profileName);
    });

    test.describe(`Render display profile`, async () => {
        test.beforeEach(async ({ searchPage, formPage }) => {
            await searchPage.goToSearch('form');
            const formName = 'PROMIS SF v1.1 - Anger 5a';
            await formPage.goToForm(formTinyId[formName]);
        });

        test(`Verify 'Matrix and Values'`, async ({ page }) => {
            await expect(page.locator(`#preview-div i.iconButton`)).toBeHidden();
            await expect(
                page.locator(`//*[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[2]`)
            ).toContainText('1');
            await expect(
                page.locator(`//*[@id='formRenderSection_In the past 7 days']//table/tbody/tr[1]/td[6]`)
            ).toContainText('5');
            await expect(page.locator(`table tr td[rowspan='2']`)).toHaveCount(0);
            await expect(
                page.locator(`//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']`)
            ).toHaveCount(15);
            await expect(
                page.locator(`//div[@id='formRenderSection_In the past 7 days']//table//input[@type='checkbox']`)
            ).toHaveCount(5);
            await expect(page.locator(`//select[@ng-model='question.question.answer']`)).toBeHidden();
            await expect(page.getByTestId('preview-div')).not.toHaveText('I was grouchy');
        });

        test(`Verify 'Matrix No Values'`, async ({ page, previewSection }) => {
            await previewSection.selectDisplayProfileByName('Matrix No Values');

            await expect(
                page.locator("//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']")
            ).toHaveCount(20);
            await expect(
                page.locator("//div[@id='formRenderSection_In the past 7 days']//table//input[@type='checkbox']")
            ).toHaveCount(5);
            await expect(page.locator("//select[@ng-model='question.question.answer']")).toBeHidden();
            await expect(page.locator('//table')).not.toHaveText(['1', '1', '1', '1', '1']);
            await expect(page.getByTestId('preview-div')).toContainText('I was grouchy');
        });

        test(`Verify 'No Matrix No Values'`, async ({ page, previewSection }) => {
            await previewSection.selectDisplayProfileByName('No Matrix No Values');
            await expect(
                page.locator(`//div[@id='formRenderSection_In the past 7 days']//table//input[@type='radio']`)
            ).toBeHidden();
            await expect(page.locator(`//select[@ng-model='question.question.answer']`)).toBeHidden();
            expect(
                (
                    await page
                        .locator(`//div[@id='I was irritated more than people knew_0-0']//label[contains(.,'Never')]`)
                        .boundingBox()
                )?.y
            ).not.toBe(
                (
                    await page
                        .locator(`//div[@id='I was irritated more than people knew_0-0']//label[contains(.,'Rarely')]`)
                        .boundingBox()
                )?.y
            );
            await page.locator(`#preview-div i.iconButton`).first().click();
            await page.locator(`//a[text()='Add Device by UDI']`).first().click();
            await page.locator(`//input[@id='deviceSearchInput']`).first().clear();
            await page
                .locator(`//input[@id='deviceSearchInput']`)
                .first()
                .fill(`=/08717648200274=,000025=A99971312345600=>014032=}013032&,1000000000000XYZ123`);
            await page.locator(`section.metadata-item button`).click();
        });

        test(`Verify 'No Matrix No Values Wider'`, async ({ page, previewSection }) => {
            await previewSection.selectDisplayProfileByName('No Matrix No Values Wider');
            expect(
                (
                    await page
                        .locator(
                            `//*[*[normalize-space()='I was irritated more than people knew']]//label[contains(.,'Never')]`
                        )
                        .boundingBox()
                )?.y
            ).toBe(
                (
                    await page
                        .locator(
                            `//*[*[normalize-space()='I was irritated more than people knew']]//label[contains(.,'Always')]`
                        )
                        .boundingBox()
                )?.y
            );
        });

        test(`Verify 'Multiple Select'`, async ({ page, previewSection }) => {
            await previewSection.selectDisplayProfileByName('Multiple Select');

            await page.locator("//div[@id='I was irritated more than people knew_0-0']//select").selectOption('Never');
            await page.locator("//div[@id='I was irritated more than people knew_0-0']//select").selectOption('Rarely');
            await page.locator("//div[@id='I was irritated more than people knew_0-0']//select").selectOption('Often');
            await page.locator("//div[@id='I felt angry_0-1']//select").selectOption('Sometimes');
            await expect(
                page.locator(`//div[@id='Adverse Event Ongoing Event Indicator_1-0']//div//input[@type='radio']`)
            ).toHaveCount(2);
            await expect(
                page.locator(
                    `//div[@id='Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage_1-1']//div//input[@type='radio']`
                )
            ).toHaveCount(3);
        });
    });
});
