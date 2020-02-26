import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_CHIPS_DEFAULT_OPTIONS, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { TagComponent } from 'tag/tag.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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
