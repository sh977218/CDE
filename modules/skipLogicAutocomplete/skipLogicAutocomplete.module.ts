import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CoreModule } from 'core/core.module';
import { MatInputModule, MatAutocompleteModule } from '@angular/material';
import { UsernameAutocompleteComponent } from 'usernameAutocomplete/usernameAutocomplete.component';
import { UserService } from '_app/user.service';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        CoreModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    declarations: [
        UsernameAutocompleteComponent
    ],
    exports: [UsernameAutocompleteComponent
    ],
    providers: [UserService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SkipLogicAutocompleteModule {
}
