import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InlineAreaEditComponent } from 'inlineAreaEdit/inlineAreaEdit.component';
import { MatIconModule } from '@angular/material/icon';
import { TextTruncateModule } from 'textTruncate/textTruncate.module';
import { RichTextEditorComponent } from 'rich-text-editor/rich-text-editor.component';

@NgModule({
    imports: [RichTextEditorComponent, CommonModule, FormsModule, MatIconModule, TextTruncateModule],
    declarations: [InlineAreaEditComponent],
    exports: [InlineAreaEditComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InlineAreaEditModule {}
