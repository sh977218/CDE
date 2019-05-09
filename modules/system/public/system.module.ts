import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';
import { TagModule } from 'tag/tag.module';

import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        UsernameAutocompleteModule,
        // internal
        TagModule
    ],
    declarations: [
    ],
    entryComponents: [],
    exports: [
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule {
}
