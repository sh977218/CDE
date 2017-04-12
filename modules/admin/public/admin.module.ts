import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ClassificationComponent } from "../../admin/public/components/classification.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";

const InlineEditComponent = upgradeAdapter.upgradeNg1Component("inlineEdit");
const InlineAreaEditComponent = upgradeAdapter.upgradeNg1Component("inlineAreaEdit");
const SortableArrayComponent = upgradeAdapter.upgradeNg1Component("sortableArray");

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        InlineEditComponent,
        InlineAreaEditComponent,
        SortableArrayComponent,
    ],
    declarations: [
        InlineEditComponent,
        InlineAreaEditComponent,
        SortableArrayComponent,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ClassificationComponent,
        ReferenceDocumentComponent
    ],
    providers: [],
    exports: [
        InlineAreaEditComponent,
        InlineEditComponent,
        SortableArrayComponent,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ClassificationComponent,
        ReferenceDocumentComponent
    ]
})
export class AdminModule {
}