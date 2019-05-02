import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NonCoreModule } from 'non-core/noncore.module';
import { MatInputModule, MatAutocompleteModule } from '@angular/material';
import { UsernameAutocompleteComponent } from 'usernameAutocomplete/usernameAutocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NonCoreModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    declarations: [
        UsernameAutocompleteComponent
    ],
    exports: [UsernameAutocompleteComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class UsernameAutocompleteModule {
}
