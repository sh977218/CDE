import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import "angular-tree-component/dist/angular-tree-component.css";
import { CKEditorModule } from 'ng2-ckeditor';
import { Select2Module } from "ng2-select2";

import { CompareModule } from 'compare/compare.module';
import { SearchModule } from 'search/search.module';
import { WidgetModule } from 'widget/widget.module';

import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { DraftSliderComponent } from 'adminItem/public/components/draftSlider.component';
import { HistoryComponent } from "./components/history.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { NamingComponent } from "./components/naming.component";
import { PropertiesComponent } from "./components/properties.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { SourcesComponent } from "./components/sources/sources.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { ClassificationViewComponent } from "./components/classification/classificationView.component";
import { CdeUpdateElementComponent } from "./components/cdeUpdateElement.component";
import { CreateFormComponent } from 'adminItem/public/components/createForm.component';
import { SaveModalComponent } from "./components/saveModal/saveModal.component";


@NgModule({
    imports: [
        CommonModule,
        CKEditorModule,
        FormsModule,
        Select2Module,
        NgbModule,
        RouterModule,
        TreeModule,
        // core
        WidgetModule,
        // internal
        CompareModule,
        SearchModule,
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemModalComponent,
        CdeUpdateElementComponent,
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
    exports: [
        AttachmentsComponent,
        ClassificationViewComponent,
        ClassifyItemModalComponent,
        CdeUpdateElementComponent,
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
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
