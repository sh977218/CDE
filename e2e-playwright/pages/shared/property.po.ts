import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { InlineEditPo } from './inline-edit.po';
import { SaveModalPo } from './save-modal.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { Property } from '../../model/type';

export class PropertyPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly inlineEdit: InlineEditPo;
    private readonly saveModal: SaveModalPo;
    private readonly updateRegistrationStatusModal: UpdateRegistrationStatusModalPo;

    constructor(
        page: Page,
        materialPage: MaterialPo,
        inlineEdit: InlineEditPo,
        saveModal: SaveModalPo,
        updateRegistrationStatusModal: UpdateRegistrationStatusModalPo
    ) {
        this.page = page;
        this.materialPage = materialPage;
        this.inlineEdit = inlineEdit;
        this.saveModal = saveModal;
        this.updateRegistrationStatusModal = updateRegistrationStatusModal;
    }

    async addProperty(newProperty: Property) {
        await this.page.getByRole('button', { name: `Add Property`, exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().locator(`[name="newKey"]`).selectOption(newProperty.key);
        await this.materialPage.matDialog().getByPlaceholder(`Property Value`).fill(newProperty.value);
        await this.materialPage.matDialog().getByRole('button', { name: `Save`, exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }
}
