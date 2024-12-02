import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { InlineEditPo } from './inline-edit.po';
import { SaveModalPo } from './save-modal.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { Property } from '../../model/type';
import { SORT_DIRECTION_MAP_SORTABLE_ARRAY } from '../../data/constants';

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

    async addProperty(newProperty: Property, config = { html: false }) {
        await this.page.getByRole('button', { name: `Add Property`, exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        await this.materialPage.matDialog().locator(`[name="newKey"]`).selectOption(newProperty.key);
        if (config.html) {
            // @TODO html format edit to be implemented
        } else {
            await this.materialPage.matDialog().getByPlaceholder(`Property Value`).fill(newProperty.value);
        }
        await this.materialPage.matDialog().getByRole('button', { name: `Save`, exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    async deletePropertyByIndex(index: number) {
        const designationRow = this.page.locator(`cde-properties dl dt`).nth(index);
        await designationRow.locator('[title="Delete Property"]').click();
        await designationRow.locator('[title="Confirm Delete"]').click();
        await this.saveModal.waitForDraftSaveComplete();
    }

    async reorderProperty(index: number, direction: string) {
        const pvRow = this.page.locator('id=properties-div').locator('dl dt').nth(index);
        const moveIcon = pvRow.locator('cde-sortable-array').getByLabel(SORT_DIRECTION_MAP_SORTABLE_ARRAY[direction]);
        await moveIcon.click();
        await this.saveModal.waitForDraftSaveComplete();
    }
}
