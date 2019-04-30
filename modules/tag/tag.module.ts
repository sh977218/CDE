import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { MatInputModule, MatIconModule, MatChipsModule, MatAutocompleteModule } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { TagComponent } from 'tag/tag.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule
    ],
    declarations: [TagComponent],
    exports: [TagComponent],
    providers: [{
        provide: MAT_CHIPS_DEFAULT_OPTIONS,
        useValue: {
            separatorKeyCodes: [ENTER, COMMA]
        }
    }],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class TagModule {
}
