import { BasePagePo } from '../base-page.po';
import { Page, Locator } from '@playwright/test';

export class FormPagePo extends BasePagePo {
    constructor(page: Page) {
        super(page);
    }

    async goToForm(tinyId: string) {
        await this.page.goto(`/formView?tinyId=${tinyId}`);
        await this.page.waitForSelector(`text=ON THIS PAGE`, { state: 'visible' });
    }

    alerts(): Locator {
        return this.page.getByTestId(`form-view-alert`);
    }

    disallowRenderingText() {
        return this.page.getByTestId(`disallow-rendering-text`);
    }

    mergeToLink(): Locator {
        return this.page.getByTestId('form-view-mergeTo-link');
    }

    formTitle(): Locator {
        return this.page.getByTestId('form-view-title');
    }

    /* Generate Details */
    copyrightCheckbox() {
        return this.page.getByTestId('copyright-checkbox');
    }

    copyrightStatement() {
        return this.page.getByTestId('copyright-statement');
    }

    copyrightAuthority() {
        return this.page.getByTestId('copyright-authority');
    }

    copyrightUrlAdd() {
        return this.page.getByTestId('copyright-url-add');
    }

    copyrightUrl() {
        return this.page.getByTestId('copyright-url');
    }

    disallowRenderingCheckbox() {
        return this.page.getByTestId(`disallowRendering-checkbox`);
    }

    /* Generate Details */

    /* Display Profile */
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

    displayProfileSelect() {
        return this.page.getByTestId('display_profile_select');
    }

    /* Display Profile */
}
