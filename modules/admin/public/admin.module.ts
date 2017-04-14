import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ClassificationTreeViewComponent } from "./components/classification/classificationTreeView.component";
import { ClassifyItemModalComponent } from "./components/classification/classifyItemModal.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemTreeViewComponent } from "./components/classification/classifyItemTreeView.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        NgbModule
    ],
    declarations: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        ClassificationComponent,
        ClassificationTreeViewComponent,
        ClassifyItemTreeViewComponent,
        ClassifyItemModalComponent
    ],
    entryComponents: [
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
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
export class AdminModule {
}
