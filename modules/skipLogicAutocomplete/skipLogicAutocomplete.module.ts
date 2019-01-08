import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CoreModule } from 'core/core.module';
import { MatInputModule, MatAutocompleteModule } from '@angular/material';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { SkipLogicAutocompleteComponent } from 'skipLogicAutocomplete/skipLogicAutocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        CoreModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    declarations: [SkipLogicAutocompleteComponent],
    exports: [SkipLogicAutocompleteComponent
    ],
    providers: [SkipLogicValidateService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SkipLogicAutocompleteModule {
}
