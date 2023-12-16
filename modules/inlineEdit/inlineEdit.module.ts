import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';

import { InlineEditComponent } from 'inlineEdit/inlineEdit.component';
import { MatIconModule } from '@angular/material/icon';
import { TextTruncateModule } from 'textTruncate/textTruncate.module';
import { InlineViewModule } from 'inlineView/inlineView.module';

@NgModule({
    imports: [CKEditorModule, CommonModule, FormsModule, MatIconModule, TextTruncateModule, InlineViewModule],
    declarations: [InlineEditComponent],
    exports: [InlineEditComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InlineEditModule {}
