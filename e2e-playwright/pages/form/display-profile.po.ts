import { expect, Page, Locator } from '@playwright/test';
import { DisplayProfile } from '../../src/model/type';
import { InlineEditPo } from '../shared/inline-edit.po';
import { MaterialPo } from '../shared/material.po';

export class DisplayProfilePo {
    private readonly page: Page;
    private readonly inlineEdit: InlineEditPo;
    private readonly materialPage: MaterialPo;

    constructor(page: Page, inlineEdit: InlineEditPo, materialPage: MaterialPo) {
        this.page = page;
        this.inlineEdit = inlineEdit;
        this.materialPage = materialPage;
    }

    addDisplayProfileButton() {
        return this.page.getByTestId('add-profile-button');
    }

    displayProfileContainer() {
        return this.page.getByTestId('display-profile');
    }

    displayProfileHeading() {
        return this.page.getByTestId('display-profile-header');
    }

    displayProfileDeleteButton(displayProfileLocator: Locator) {
        return displayProfileLocator.getByTestId('delete-display-profile');
    }

    displayProfileConfirmButton(displayProfileLocator: Locator) {
        return displayProfileLocator.locator('a').first();
    }

    displayProfileStyleSelect(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId('display-profile-style');
    }

    displayProfileDisplayAsMatrixCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-as-matrix`).locator('input');
    }

    displayProfileDisplayValuesCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-values`).locator('input');
    }

    displayProfileDisplayInstructionsCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-instructions`).locator('input');
    }

    displayProfileDisplayCopyrightCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-copyright`).locator('input');
    }

    displayProfileDisplayQuestionNumberCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-question-number`).locator('input');
    }

    displayProfileDisplayInvisibleQuestionsCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-invisible-questions`).locator('input');
    }

    displayProfileDisplayDisplayMetadataDeviceCheckbox(displayProfileContainerLocator: Locator) {
        return displayProfileContainerLocator.getByTestId(`display-profile-display-metadata-device`).locator('input');
    }

    previewAnswerValue() {
        return this.page.getByTestId('preview-div').getByTestId('native-value');
    }

    displayProfileAnswerValue() {
        return this.displayProfileContainer().first().getByTestId('native-value');
    }

    previewMetaDeviceAddButton() {
        return this.page.getByTestId('preview-div').getByTestId('meta-device-add-button');
    }

    displayProfileMetaDeviceAddButton() {
        return this.displayProfileContainer().first().getByTestId('meta-device-add-button');
    }

    previewMatrixCheckbox() {
        return this.page.locator(`//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='checkbox']`);
    }

    previewMatrixRadio() {
        return this.page.locator(`//*[@id='preview-div']//cde-native-section-matrix//table//input[@type='radio']`);
    }

    addDisplayProfile = async ({
        profileName,
        styleName,
        numberOfColumn,
        answerDropdownLimit,
        matrix,
        displayValues,
        instructions,
        numbering,
        displayInvisibleQuestion,
        displayMetadataDevice,
    }: DisplayProfile) => {
        await this.addDisplayProfileButton().click();
        const displayProfileContainerLocator = this.displayProfileContainer().last();
        await this.inlineEdit.editIcon(displayProfileContainerLocator).click();
        await this.inlineEdit.inputField(displayProfileContainerLocator).fill(profileName);
        await this.inlineEdit.submitButton(displayProfileContainerLocator).click();

        await this.displayProfileStyleSelect(displayProfileContainerLocator).selectOption(styleName);
        if (!matrix) {
            await this.displayProfileDisplayAsMatrixCheckbox(displayProfileContainerLocator).uncheck();
        }
        if (displayValues) {
            await this.displayProfileDisplayValuesCheckbox(displayProfileContainerLocator).check();
        }
        if (!instructions) {
            await this.displayProfileDisplayInstructionsCheckbox(displayProfileContainerLocator).uncheck();
        }
        if (!numbering) {
            await this.displayProfileDisplayQuestionNumberCheckbox(displayProfileContainerLocator).uncheck();
        }
        if (displayInvisibleQuestion) {
            await this.displayProfileDisplayInvisibleQuestionsCheckbox(displayProfileContainerLocator).check();
        }
        if (displayMetadataDevice) {
            await this.displayProfileDisplayDisplayMetadataDeviceCheckbox(displayProfileContainerLocator).check();
        }
    };

    deleteDisplayProfile = async (profileName: string) => {
        const displayProfileLocator = this.displayProfileHeading().filter({ hasText: profileName });
        await this.displayProfileDeleteButton(displayProfileLocator).click();
        await this.displayProfileConfirmButton(displayProfileLocator).click();
    };
}
