import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ClassificationComponent } from "../../admin/public/components/classification.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";

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
        ReferenceDocumentComponent
    ],
    providers: [],
    exports: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective
    ]
})
export class AdminModule {
}