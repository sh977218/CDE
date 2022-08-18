import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { CommentsComponent } from 'discuss/components/comments/comments.component';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

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
    exports: [DiscussAreaComponent, LatestCommentsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DiscussModule {}
