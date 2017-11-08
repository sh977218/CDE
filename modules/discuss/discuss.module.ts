import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';
import { WidgetModule } from 'widget/widget.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        DiscussAreaComponent,
        LatestCommentsComponent
    ],
    entryComponents: [
        DiscussAreaComponent,
        LatestCommentsComponent
    ],
    exports: [
        DiscussAreaComponent,
        LatestCommentsComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DiscussModule {
}
