import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { InlineEditPo } from './inline-edit.po';
import { SaveModalPo } from './save-modal.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { Property } from '../../model/type';
import { SORT_DIRECTION_MAP_SORTABLE_ARRAY } from '../../data/constants';

export class RelatedDocumentPo {
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

    async reorderRelatedDocument(index: number, direction: string) {
        const pvRow = this.page.locator('id=reference-documents-div').locator('table tbody tr').nth(index);
        const moveIcon = pvRow.locator('cde-sortable-array').getByLabel(SORT_DIRECTION_MAP_SORTABLE_ARRAY[direction]);
        await moveIcon.click();
        await this.saveModal.waitForDraftSaveComplete();
    }
}
