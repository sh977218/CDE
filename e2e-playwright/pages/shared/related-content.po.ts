import { Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { InlineEditPo } from './inline-edit.po';
import { SaveModalPo } from './save-modal.po';
import { UpdateRegistrationStatusModalPo } from './update-registration-status-modal.po';
import { SORT_DIRECTION_MAP_SORTABLE_ARRAY } from '../../data/constants';
import { RelatedDocument } from '../../model/type';

export class RelatedContentPo {
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

    relatedContentDiv() {
        return this.page.locator('id=related-content-div');
    }

    linkedFormTab() {
        return this.relatedContentDiv().getByRole('tab', { name: 'Linked Forms' });
    }

    moreLikeThisTab() {
        return this.relatedContentDiv().getByRole('tab', { name: 'More like this' });
    }

    dataSetTab() {
        return this.relatedContentDiv().getByRole('tab', { name: 'Linked Data Set' });
    }

    moreLikeThisList() {
        return this.relatedContentDiv().locator('cde-mlt cde-summary-list');
    }
    dataSetTable() {
        return this.relatedContentDiv().locator('cde-datasets table');
    }
}
