import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatDialogModule, MatPaginatorModule, MatButtonModule } from '@angular/material';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { CommentsComponent } from 'discuss/components/comments/comments.component';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        // non-core

        // internal
    ],
    declarations: [
        DiscussAreaComponent,
        CommentsComponent,
        LatestCommentsComponent,
    ],
    entryComponents: [
        DiscussAreaComponent,
        CommentsComponent,
        LatestCommentsComponent,
    ],
    exports: [
        DiscussAreaComponent,
        LatestCommentsComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DiscussModule {
}
