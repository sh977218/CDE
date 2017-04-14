import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { AttachmentsComponent } from "./components/attachments/attachments.component";
import { IdentifiersComponent } from "../../adminItem/public/components/identifiers.component";
import { PropertiesComponent } from "../../adminItem/public/components/properties.component";
import { NamingComponent } from "../../adminItem/public/components/naming.component";
import { ReferenceDocumentComponent } from "../../adminItem/public/components/referenceDocument.component";

import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module
    ],
    declarations: [
        AttachmentsComponent,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
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
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminItemModule {
}
