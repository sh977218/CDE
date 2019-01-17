import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import "angular-tree-component/dist/angular-tree-component.css";
import { CKEditorModule } from 'ng2-ckeditor';
import { NgSelectModule } from '@ng-select/ng-select';

import { CompareModule } from 'compare/compare.module';
import { SearchModule } from 'search/search.module';


import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { DraftSliderComponent } from 'adminItem/public/components/draftSlider.component';
import { HistoryComponent } from "./components/history.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { NamingComponent } from "./components/naming/naming.component";
import { PropertiesComponent } from "./components/properties/properties.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { SourcesComponent } from "./components/sources/sources.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { ClassificationViewComponent } from "./components/classification/classificationView.component";
import { CreateFormComponent } from 'adminItem/public/components/createForm.component';
import { SaveModalComponent } from "./components/saveModal/saveModal.component";
import { DeleteModalComponent } from 'adminItem/public/components/deleteModal/deleteModal.component';
import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
import { MatButtonModule, MatDialogModule, MatIconModule, MatTabsModule } from "@angular/material";

@NgModule({
    imports: [
        CommonModule,
        CKEditorModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        RouterModule,
        TreeModule.forRoot(),
        // core

        // internal
        CompareModule,
        SearchModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemModalComponent,
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
    entryComponents: [
        NewDefinitionComponent,
        NewDesignationComponent
    ],
    exports: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemModalComponent,
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
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
