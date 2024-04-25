import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@ali-hm/angular-tree-component';
import { AttachmentsComponent } from 'adminItem/attachments/attachments.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { ClassificationViewComponent } from 'adminItem/classification/classificationView.component';
import { DeleteClassificationModalComponent } from 'adminItem/classification/delete-classification-modal/delete-classification-modal.component';
import { DeleteDraftModalComponent } from 'adminItem/delete-draft-modal/delete-draft-modal.component';
import { DeReadOnlyComponent } from 'adminItem/deReadOnly/deReadOnly.component';
import { DeReadOnlyDataTypeComponent } from 'adminItem/deReadOnly/deReadOnlyDataType.component';
import { DraftSliderComponent } from 'adminItem/draftSlider/draftSlider.component';
import { FormReadOnlyComponent } from 'adminItem/formReadOnly/formReadOnly.component';
import { HistoryComponent } from 'adminItem/history/history.component';
import { AddIdentifierModalComponent } from 'adminItem/identfifiers/add-identifier-modal/add-identifier-modal.component';
import { IdentifiersComponent } from 'adminItem/identfifiers/identifiers.component';
import { LinkedFormModalComponent } from 'adminItem/linkedForms/linked-form-modal/linked-form-modal.component';
import { LinkedFormsComponent } from 'adminItem/linkedForms/linkedForms.component';
import { NewDesignationComponent } from 'adminItem/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/naming/definition/newDefinition.component';
import { NamingComponent } from 'adminItem/naming/naming.component';
import { AddPropertyModalComponent } from 'adminItem/properties/add-property-modal/add-property-modal.component';
import { PropertiesComponent } from 'adminItem/properties/properties.component';
import { RegistrationComponent } from 'adminItem/registration/registration.component';
import { RegistrationStatusModalComponent } from 'adminItem/registration/registration-status-modal/registration-status-modal.component';
import { RelatedContentComponent } from 'adminItem/related-content/related-content.component';
import { AddRelatedDocumentModalComponent } from 'adminItem/related-document/add-related-document-modal/add-related-document-modal.component';
import { RelatedDocumentComponent } from 'adminItem/related-document/related-document.component';
import { SaveModalComponent } from 'adminItem/save-modal/saveModal.component';
import { SourcesComponent } from 'adminItem/sources/sources.component';
import { MoreLikeThisComponent } from 'cde/mlt/moreLikeThis.component';
import { DatasetsComponent } from 'cde/datasets/datasets.component';
import { CompareModule } from 'compare/compare.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { InlineViewModule } from 'inlineView/inlineView.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { TagModule } from 'tag/tag.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ClassifyItemDialogComponent } from './classification/classify-item-dialog/classify-item-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
    imports: [
        CommonModule,
        CKEditorModule,
        FormsModule,
        RouterModule,
        TreeModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
        TourMatMenuModule,
        MatCheckboxModule,
        MatDividerModule,
        MatExpansionModule,
        // non-core
        NonCoreModule,
        // internal
        CompareModule,
        SearchModule,
        SortableArrayModule,
        DeleteWithConfirmModule,
        InlineEditModule,
        InlineAreaEditModule,
        InlineSelectEditModule,
        InlineViewModule,
        NativeRenderModule,
        TagModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatMenuModule,
        MatTreeModule,
        MatRadioModule,
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationViewComponent,
        DeleteClassificationModalComponent,
        ClassifyItemComponent,
        ClassifyItemDialogComponent,
        DeReadOnlyComponent,
        DeReadOnlyDataTypeComponent,
        FormReadOnlyComponent,
        NewDefinitionComponent,
        NewDesignationComponent,
        DraftSliderComponent,
        IdentifiersComponent,
        AddIdentifierModalComponent,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        AddPropertyModalComponent,
        RegistrationComponent,
        RegistrationStatusModalComponent,
        SaveModalComponent,
        SourcesComponent,
        DeleteDraftModalComponent,
        AddRelatedDocumentModalComponent,
        RelatedDocumentComponent,
        RelatedContentComponent,
        LinkedFormModalComponent,
        MoreLikeThisComponent,
        DatasetsComponent,
    ],
    exports: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemComponent,
        DeReadOnlyComponent,
        DeReadOnlyDataTypeComponent,
        DraftSliderComponent,
        FormReadOnlyComponent,
        IdentifiersComponent,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        RegistrationComponent,
        SaveModalComponent,
        SourcesComponent,
        RelatedDocumentComponent,
        RelatedContentComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminItemModule {}
