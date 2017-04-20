import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { PropertiesComponent } from "./components/properties.component";
import { NamingComponent } from "./components/naming.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageModule } from "angular-2-local-storage/dist/index";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { ClassificationComponent } from "./components/classification/classification.component";

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
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        ClassificationComponent,
        ClassifyItemModalComponent,
    ],
    entryComponents: [
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        AttachmentsComponent
        ClassificationComponent
    ],
    exports: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        ClassificationComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
