import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { InlineEditPo } from './inline-edit.po';
import { SaveModalPo } from './save-modal.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { SORT_DIRECTION_MAP_SORTABLE_ARRAY } from '../../data/constants';
import { RelatedDocument } from '../../model/type';

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

    async addRelatedDocument(newRelatedDocument: RelatedDocument) {
        await this.page.getByRole('button', { name: `Add Related Document`, exact: true }).click();
        await this.materialPage.matDialog().waitFor();
        if (newRelatedDocument.id) {
            await this.materialPage.matDialog().getByPlaceholder(`ID`, { exact: true }).fill(newRelatedDocument.id);
        }
        if (newRelatedDocument.title) {
            await this.materialPage.matDialog().getByPlaceholder(`Title`).fill(newRelatedDocument.title);
        }
        if (newRelatedDocument.docType) {
            await this.materialPage.matDialog().getByPlaceholder(`Doc Type`).fill(newRelatedDocument.docType);
        }
        if (newRelatedDocument.uri) {
            await this.materialPage.matDialog().getByPlaceholder(`URI`).fill(newRelatedDocument.uri);
        }
        if (newRelatedDocument.providerOrg) {
            await this.materialPage.matDialog().getByPlaceholder(`Provider Org`).fill(newRelatedDocument.providerOrg);
        }
        if (newRelatedDocument.languageCode) {
            await this.materialPage.matDialog().getByPlaceholder(`Language Code`).fill(newRelatedDocument.languageCode);
        }
        if (newRelatedDocument.document) {
            await this.materialPage.matDialog().getByPlaceholder(`Document`).fill(newRelatedDocument.document);
        }
        await this.materialPage.matDialog().getByRole('button', { name: `Save`, exact: true }).click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
        await this.saveModal.waitForDraftSaveComplete();
    }

    async deleteRelatedDocumentByIndex(index: number) {
        const relatedDocumentRow = this.page.locator(`cde-related-document table tbody tr`).nth(index);
        await relatedDocumentRow.locator('[title="Remove"]').click();
        await this.saveModal.waitForDraftSaveComplete();
    }
}
