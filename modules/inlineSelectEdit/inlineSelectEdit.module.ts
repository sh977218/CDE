import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InlineSelectEditComponent } from 'inlineSelectEdit/inlineSelectEdit.component';
import { MatIconModule } from '@angular/material/icon';
import { TextTruncateModule } from 'textTruncate/textTruncate.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RichTextEditorComponent } from 'rich-text-editor/rich-text-editor.component';

@NgModule({
    imports: [RichTextEditorComponent, CommonModule, FormsModule, MatIconModule, MatTooltipModule, TextTruncateModule],
    declarations: [InlineSelectEditComponent],
    exports: [InlineSelectEditComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InlineSelectEditModule {}
