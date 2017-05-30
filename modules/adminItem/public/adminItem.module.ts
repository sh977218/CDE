import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { IdentifiersComponent } from "./components/identifiers.component";
import { PropertiesComponent } from "./components/properties.component";
import { HistoryComponent } from "./components/history.component";
import { NamingComponent } from "./components/naming.component";
import { ReferenceDocumentComponent } from "./components/referenceDocument.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageModule } from "angular-2-local-storage/dist/index";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ClassifyCdesModalComponent } from "./components/classification/classifyCdesModal.component";
import { InlineEditDirective, InlineSelectEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { SourcesComponent } from "./components/sources/sources.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { CompareModule } from "../../compare/compare.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        NgbModule,
        LocalStorageModule.withConfig({prefix: "nlmcde", storageType: "localStorage"}),
        TreeModule,
        CompareModule
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
        PropertiesComponent,
        HistoryComponent,
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
        PropertiesComponent,
        HistoryComponent,
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
        HistoryComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        RegistrationComponent,
        SourcesComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
