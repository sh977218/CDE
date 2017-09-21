import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { CKEditorModule } from 'ng2-ckeditor';

import { InlineEditComponent } from "./inlineEdit/inlineEdit.component";
import { InlineAreaEditComponent } from "./inlineEdit/inlineAreaEdit.component";
import { PlaceHoldEmptyPipe } from "./pipes/placeHoldEmpty.pipe";
import { TextTruncateComponent } from "./text/textTruncate.component";
import { SortableArrayComponent } from 'widget/sortableArray/sortableArray.component';

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        NgbModule,
    ],
    declarations: [
        InlineAreaEditComponent,
        InlineEditComponent,
        PlaceHoldEmptyPipe,
        TextTruncateComponent,
        SortableArrayComponent,
    ],
    exports: [
        InlineEditComponent,
        InlineAreaEditComponent,
        PlaceHoldEmptyPipe,
        SortableArrayComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class WidgetModule {
}
