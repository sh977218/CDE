import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';

import { MatIconModule } from '@angular/material/icon';
import { DeleteWithConfirmComponent } from 'deleteWithConfirm/deleteWithConfirm.component';

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        MatIconModule
    ],
    declarations: [DeleteWithConfirmComponent],
    exports: [DeleteWithConfirmComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DeleteWithConfirmModule {
}
