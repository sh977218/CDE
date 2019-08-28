import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NonCoreModule } from 'non-core/noncore.module';
import {
    MatIconModule, MatInputModule, MatSelectModule, MatButtonModule, MatAutocompleteModule, MatDialogModule
} from '@angular/material';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { SkipLogicAutocompleteComponent } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NonCoreModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatAutocompleteModule
    ],
    declarations: [
        SkipLogicAutocompleteComponent,
        SkipLogicComponent
    ],
    entryComponents: [
        SkipLogicAutocompleteComponent,
        SkipLogicComponent
    ],
    exports: [SkipLogicComponent],
    providers: [SkipLogicValidateService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SkipLogicModule {
}
