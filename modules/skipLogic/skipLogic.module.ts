import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NonCoreModule } from 'non-core/noncore.module';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { SkipLogicAutocompleteComponent } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

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
