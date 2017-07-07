import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { Select2Module } from "ng2-select2";

import { WidgetModule } from "../../widget/widget.module";

import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { HistoryComponent } from "./components/history.component";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ClassifyCdesModalComponent } from "./components/classification/classifyCdesModal.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import {
    FormSummaryListDirective,
    InlineEditDirective,
    InlineSelectEditDirective,
    SortableArrayDirective
} from "./upgrade-components";
import { NamingComponent } from "./components/naming.component";
import { PropertiesComponent } from "./components/properties.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { SourcesComponent } from "./components/sources/sources.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { LocalStorageModule } from "angular-2-local-storage";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { CompareModule } from "../../compare/compare.module";
import { ClassificationViewComponent } from "./components/classification/classificationView.component";
import { SystemModule } from "../../system/public/system.module";
import { CopyElementComponent } from "./components/copyElement.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        NgbModule,
        LocalStorageModule.withConfig({
            prefix: "nlmcde",
            storageType: "localStorage"
        }),
        // internal
        WidgetModule,
        CompareModule,
        TreeModule,
        SystemModule
    ],
    declarations: [
        AttachmentsComponent,
        ClassificationComponent,
        ClassificationViewComponent,
        ClassifyCdesModalComponent,
        ClassifyItemModalComponent,
        CopyElementComponent,
        FormSummaryListDirective,
        IdentifiersComponent,
        InlineEditDirective,
        InlineSelectEditDirective,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SortableArrayDirective,
        SourcesComponent
    ],
    entryComponents: [
        AttachmentsComponent,
        ClassificationComponent,
        CopyElementComponent,
        IdentifiersComponent,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SourcesComponent
    ],
    exports: [
        ClassificationComponent,
        ClassificationViewComponent,
        ClassifyItemModalComponent,
        IdentifiersComponent,
        InlineEditDirective,
        InlineSelectEditDirective,
        LinkedFormsComponent,
        HistoryComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SortableArrayDirective,
        SourcesComponent,
        SystemModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
