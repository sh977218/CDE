import { FormPagePo } from '../../pages/form/form-page.po';
import { InlineEditPo } from '../../pages/shared/inline-edit.po';
import { MaterialPo } from '../../pages/shared/material.po';
import { DisplayProfile } from '../../src/model/type';

export const addDisplayProfile = async (
    { formPage, inlineEdit }: { formPage: FormPagePo; inlineEdit: InlineEditPo },
    {
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
    }: DisplayProfile
) => {
    await formPage.addDisplayProfileButton().click();
    const displayProfileContainerLocator = formPage.displayProfileContainer().first();
    await inlineEdit.editIcon(displayProfileContainerLocator).click();
    await inlineEdit.inputField(displayProfileContainerLocator).fill(profileName);
    await inlineEdit.submitButton(displayProfileContainerLocator).click();

    await formPage.displayProfileStyleSelect(displayProfileContainerLocator).selectOption(styleName);
    if (!matrix) {
        await formPage.displayProfileDisplayAsMatrixCheckbox(displayProfileContainerLocator).uncheck();
    }
    if (displayValues) {
        await formPage.displayProfileDisplayValuesCheckbox(displayProfileContainerLocator).check();
    }
    if (!instructions) {
        await formPage.displayProfileDisplayInstructionsCheckbox(displayProfileContainerLocator).uncheck();
    }
    if (!numbering) {
        await formPage.displayProfileDisplayQuestionNumberCheckbox(displayProfileContainerLocator).uncheck();
    }
    if (displayInvisibleQuestion) {
        await formPage.displayProfileDisplayInvisibleQuestionsCheckbox(displayProfileContainerLocator).check();
    }
    if (displayMetadataDevice) {
        await formPage.displayProfileDisplayDisplayMetadataDeviceCheckbox(displayProfileContainerLocator).check();
    }
};

export const deleteDisplayProfile = async (
    { formPage }: { formPage: FormPagePo; inlineEdit: InlineEditPo },
    { profileName }: DisplayProfile
) => {
    const displayProfileLocator = formPage.displayProfileHeading().filter({ hasText: profileName });
    await formPage.displayProfileDeleteButton(displayProfileLocator).click();
    await formPage.displayProfileConfirmButton(displayProfileLocator).click();
};

export const selectDisplayProfileByName = async (
    {
        formPage,
        materialPage,
    }: {
        formPage: FormPagePo;
        materialPage: MaterialPo;
    },
    profileName: string
) => {
    await formPage.displayProfileSelect().click();
    await materialPage.matMenuItem(profileName).click();
};
