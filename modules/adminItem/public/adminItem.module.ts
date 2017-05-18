import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
<<<<<<< HEAD
import { Select2Module } from "ng2-select2";
import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { PropertiesComponent } from "./components/properties.component";
import { NamingComponent } from "./components/naming.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { InlineSelectEditDirective, InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
======
=
>>>>>>>
5
a54f9b9048ec55ec9aaf1c23245af8727b7c653
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageModule } from "angular-2-local-storage/dist/index";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { Select2Module } from "ng2-select2";

import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ClassifyCdesModalComponent } from "./components/classification/classifyCdesModal.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { NamingComponent } from "./components/naming.component";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { PropertiesComponent } from "./components/properties.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";

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
        TreeModule
    ],
    declarations: [
        AttachmentsComponent,
        InlineSelectEditDirective,
        ClassificationComponent,
        ClassifyCdesModalComponent,
        ClassifyItemModalComponent,
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        NamingComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        ReferenceDocumentComponent
    ],
    entryComponents: [
        AttachmentsComponent,
        ClassificationComponent,
        IdentifiersComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent
    ],
    exports: [
        InlineSelectEditDirective,
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        ClassificationComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
