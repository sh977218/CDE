import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';

import { CoreModule } from 'core/core.module';
import { DeleteWithConfirmComponent } from 'widget/deleteWithConfirm.component';
import { InlineAreaEditComponent } from 'widget/inlineEdit/inlineAreaEdit.component';
import { InlineEditComponent } from 'widget/inlineEdit/inlineEdit.component';
import { InlineSelectEditComponent } from 'widget/inlineEdit/inlineSelectEdit.component';
import { PlaceHoldEmptyPipe } from 'widget/pipes/placeHoldEmpty.pipe';
import { SortableArrayComponent } from 'widget/sortableArray/sortableArray.component';
import { TextTruncateComponent } from 'widget/text/textTruncate.component';
import { MatIconModule } from '@angular/material';

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        NgbModule.forRoot(),
        CoreModule,
        MatIconModule,
    ],
    declarations: [
        DeleteWithConfirmComponent,
        InlineAreaEditComponent,
        InlineEditComponent,
        InlineSelectEditComponent,
        PlaceHoldEmptyPipe,
        TextTruncateComponent,
        SortableArrayComponent,
    ],
    exports: [
        DeleteWithConfirmComponent,
        InlineAreaEditComponent,
        InlineEditComponent,
        InlineSelectEditComponent,
        PlaceHoldEmptyPipe,
        SortableArrayComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class WidgetModule {
}
