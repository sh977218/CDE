import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatDialogModule } from '@angular/material';

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';
import { WidgetModule } from 'widget/widget.module';
import { CommentsComponent } from 'discuss/components/comments/comments.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatDialogModule,
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        DiscussAreaComponent,
        CommentsComponent,
        LatestCommentsComponent
    ],
    entryComponents: [
        DiscussAreaComponent,
        CommentsComponent,
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
