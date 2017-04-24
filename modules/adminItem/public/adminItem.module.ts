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

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module
    ],
    declarations: [
        AttachmentsComponent,
        InlineEditDirective,
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
        AttachmentsComponent
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
