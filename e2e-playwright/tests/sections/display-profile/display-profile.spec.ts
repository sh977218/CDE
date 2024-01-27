import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Display profile`, async () => {
    test(`Form identifiers always visible`, async ({
        previewSection,
        formPage,
        displayProfileSection,
        navigationMenu,
    }) => {
        const formName = 'Multiple Select Display Profile Test';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);

        await previewSection.selectDisplayProfileByName('Multiple Select Display Profile');
        await test.step(`Preview has dropdowns`, async () => {
            await expect(displayProfileSection.previewSelectDropdown()).toHaveCount(14);
        });
    });

    test(`Answer value`, async ({ previewSection, displayProfileSection, navigationMenu }) => {
        const formName = 'Answer Value Display Profile Test';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);

        await previewSection.selectDisplayProfileByName('Answer Value Display Profile');
        await test.step(`Preview has answer value`, async () => {
            expect(await displayProfileSection.previewAnswerValue().count()).toBeGreaterThanOrEqual(1);
        });
        await test.step(`Display profile has answer value`, async () => {
            expect(await displayProfileSection.displayProfileAnswerValue().count()).toBeGreaterThanOrEqual(1);
        });
    });

    test(`Meta device`, async ({ previewSection, displayProfileSection, navigationMenu }) => {
        const formName = 'Metadata Device Display Profile Test';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);

        await previewSection.selectDisplayProfileByName('Metadata Device Display Profile');

        await test.step(`Preview has meta device`, async () => {
            expect(await displayProfileSection.previewMetaDeviceAddButton().count()).toBeGreaterThanOrEqual(1);
        });
        await test.step(`Display profile has meta device`, async () => {
            expect(await displayProfileSection.displayProfileMetaDeviceAddButton().count()).toBeGreaterThanOrEqual(1);
        });
    });

    test(`Matrix`, async ({ previewSection, displayProfileSection, navigationMenu }) => {
        const formName = 'Matrix Display Profile Test';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);

        await previewSection.selectDisplayProfileByName('Matrix Display Profile');

        await navigationMenu.gotoFormByName(formName);

        await test.step(`Preview has meta device`, async () => {
            await expect(displayProfileSection.previewMatrixCheckbox()).toHaveCount(5);
        });
        await test.step(`Display profile has meta device`, async () => {
            expect(await displayProfileSection.previewMatrixRadio().count()).toBeGreaterThanOrEqual(1);
        });

        await previewSection.selectDisplayProfileByName('No Matrix Display Profile');

        await test.step(`Preview has no matrix checkbox`, async () => {
            await expect(displayProfileSection.previewMatrixCheckbox()).toHaveCount(0);
        });
        await test.step(`Display profile no matrix radio`, async () => {
            await expect(displayProfileSection.previewMatrixRadio()).toHaveCount(0);
        });
    });

    test.describe(`Render display profile`, async () => {
        test.beforeEach(async ({ navigationMenu }) => {
            const formName = 'PROMIS SF v1.1 - Anger 5a';
            await navigationMenu.gotoFormByName(formName);
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
