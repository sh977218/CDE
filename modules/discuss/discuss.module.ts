import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { CommentsComponent } from 'discuss/components/comments/comments.component';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        RouterLink,
        // non-core

        // internal
    ],
    declarations: [DiscussAreaComponent, CommentsComponent, LatestCommentsComponent],
    exports: [DiscussAreaComponent, LatestCommentsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DiscussModule {}
