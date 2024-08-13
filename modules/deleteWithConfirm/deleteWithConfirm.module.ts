import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { DeleteWithConfirmComponent } from 'deleteWithConfirm/deleteWithConfirm.component';
import { RichTextEditorComponent } from 'rich-text-editor/rich-text-editor.component';

@NgModule({
    imports: [RichTextEditorComponent, CommonModule, FormsModule, MatIconModule],
    declarations: [DeleteWithConfirmComponent],
    exports: [DeleteWithConfirmComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeleteWithConfirmModule {}
