import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';

import { InlineSelectEditComponent } from 'inlineSelectEdit/inlineSelectEdit.component';
import { MatIconModule } from '@angular/material/icon';
import { TextTruncateModule } from 'textTruncate/textTruncate.module';

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        MatIconModule,
        TextTruncateModule,
    ],
    declarations: [
        InlineSelectEditComponent,
    ],
    exports: [
        InlineSelectEditComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class InlineSelectEditModule {
}
