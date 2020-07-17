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
import { AttachmentsComponent } from 'adminItem/public/components/attachments/attachments.component';
import { DraftSliderComponent } from 'adminItem/public/components/draftSlider.component';
import { HistoryComponent } from 'adminItem/public/components/history/history.component';
import { ClassifyItemComponent } from 'adminItem/public/components/classification/classifyItem.component';
import { ClassifyItemDialogComponent } from 'adminItem/public/components/classification/classifyItemDialog.component';
import { IdentifiersComponent } from 'adminItem/public/components/identifiers.component';
import { NamingComponent } from 'adminItem/public/components/naming/naming.component';
import { PropertiesComponent } from 'adminItem/public/components/properties/properties.component';
import { ReferenceDocumentComponent } from 'adminItem/public/components/referenceDocument.component';
import { SourcesComponent } from 'adminItem/public/components/sources/sources.component';
import { RegistrationComponent } from 'adminItem/public/components/registration/registration.component';
import { LinkedFormsComponent } from 'adminItem/public/components/linkedForms.component';
import { ClassificationViewComponent } from 'adminItem/public/components/classification/classificationView.component';
import { CreateFormComponent } from 'adminItem/public/components/createForm/createForm.component';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';
import { DeleteModalComponent } from 'adminItem/public/components/deleteModal/deleteModal.component';
import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
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
        MatTabsModule
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemComponent,
        ClassifyItemDialogComponent,
        CreateFormComponent,
        NewDefinitionComponent,
        NewDesignationComponent,
        DraftSliderComponent,
        IdentifiersComponent,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SaveModalComponent,
        DeleteModalComponent,
        SourcesComponent,
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
        DeleteModalComponent,
        SourcesComponent,
    ],
    entryComponents: [
        ClassifyItemDialogComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
