import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";
import { FormsModule } from "@angular/forms";

const InlineEditComponent = upgradeAdapter.upgradeNg1Component("inlineEdit");
const InlineAreaEditComponent = upgradeAdapter.upgradeNg1Component("inlineAreaEdit");
const SortableArrayComponent = upgradeAdapter.upgradeNg1Component("sortableArray");

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module
    ],
    declarations: [
        InlineEditComponent,
        InlineAreaEditComponent,
        SortableArrayComponent,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
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
        ReferenceDocumentComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
}