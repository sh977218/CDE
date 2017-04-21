import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";

import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";
import { ArrayListPipe } from "./arrayList.pipe";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module
    ],
    declarations: [
        ArrayListPipe,
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent
    ],
    entryComponents: [
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
    ],
    exports: [
        ArrayListPipe,
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PlaceHoldEmptyPipe,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
}
