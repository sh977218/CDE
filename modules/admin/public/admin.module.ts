import { FormsModule } from "@angular/forms";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ClassificationComponent } from "./components/classification/classification.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { ClassificationTreeViewComponent } from "./components/classification/classificationTreeView.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module
    ],
    declarations: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ClassificationComponent,
        ClassificationTreeViewComponent,
        ReferenceDocumentComponent
    ],
    entryComponents: [
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ClassificationComponent,
        ReferenceDocumentComponent
    ],
    providers: [],
    exports: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ClassificationComponent,
        ReferenceDocumentComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
}