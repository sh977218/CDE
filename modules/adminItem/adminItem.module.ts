import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AttachmentsComponent } from 'adminItem/attachments/attachments.component';
import { DraftSliderComponent } from 'adminItem/draftSlider/draftSlider.component';
import { HistoryComponent } from 'adminItem/history/history.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { ClassifyItemDialogComponent } from 'adminItem/classification/classifyItemDialog.component';
import { IdentifiersComponent } from 'adminItem/identfifiers/identifiers.component';
import { NamingComponent } from 'adminItem/naming/naming.component';
import { PropertiesComponent } from 'adminItem/properties/properties.component';
import { ReferenceDocumentComponent } from 'adminItem/referenceDocument/referenceDocument.component';
import { SourcesComponent } from 'adminItem/sources/sources.component';
import { RegistrationComponent } from 'adminItem/registration/registration.component';
import { LinkedFormsComponent } from 'adminItem/linkedForms/linkedForms.component';
import { ClassificationViewComponent } from 'adminItem/classification/classificationView.component';
import { CreateFormComponent } from 'adminItem/createForm/createForm.component';
import { NewDesignationComponent } from 'adminItem/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/naming/definition/newDefinition.component';
import { CompareModule } from 'compare/compare.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { TagModule } from 'tag/tag.module';
import { MatCardModule } from '@angular/material/card';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import {
    RegistrationStatusModalComponent
} from 'adminItem/registration/registration-status-modal/registration-status-modal.component';
import { DeleteDraftModalComponent } from 'adminItem/delete-draft-modal/delete-draft-modal.component';
import { SaveModalComponent } from 'adminItem/save-modal/saveModal.component';
import { AddPropertyModalComponent } from 'adminItem/properties/add-property-modal/add-property-modal.component';
import {
    DeleteClassificationModalComponent
} from 'adminItem/classification/delete-classification-modal/delete-classification-modal.component';
import {
    AddIdentifierModalComponent
} from 'adminItem/identfifiers/add-identifier-modal/add-identifier-modal.component';

@NgModule({
    imports: [
        CommonModule,
        CKEditorModule,
        FormsModule,
        NgbModule,
        RouterModule,
        TreeModule,
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
        TagModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
        TourMatMenuModule
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationViewComponent,
        DeleteClassificationModalComponent,
        ClassifyItemComponent,
        ClassifyItemDialogComponent,
        CreateFormComponent,
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
        ReferenceDocumentComponent,
        RegistrationComponent,
        RegistrationStatusModalComponent,
        SaveModalComponent,
        SourcesComponent,
        DeleteDraftModalComponent,
    ],
    exports: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemComponent,
        CreateFormComponent,
        DraftSliderComponent,
        IdentifiersComponent,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SaveModalComponent,
        SourcesComponent,
    ],
    entryComponents: [
        ClassifyItemDialogComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
