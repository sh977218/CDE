import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageModule } from "angular-2-local-storage/dist/index";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { Select2Module } from "ng2-select2";

import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ClassifyCdesModalComponent } from "./components/classification/classifyCdesModal.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { InlineEditDirective, InlineSelectEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { NamingComponent } from "./components/naming.component";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { PropertiesComponent } from "./components/properties.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { SourcesComponent } from "./components/sources/sources.component";
import { RegistrationComponent } from "./components/registration/registration.component";

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
        ClassificationComponent,
        ClassifyCdesModalComponent,
        ClassifyItemModalComponent,
        InlineEditDirective,
        InlineSelectEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        NamingComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SourcesComponent
    ],
    entryComponents: [
        AttachmentsComponent,
        ClassificationComponent,
        IdentifiersComponent,
        NamingComponent,
        PropertiesComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SourcesComponent
    ],
    exports: [
        ClassificationComponent,
        InlineEditDirective,
        InlineSelectEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SourcesComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
