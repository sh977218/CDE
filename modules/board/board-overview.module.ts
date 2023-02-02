import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BoardOverviewComponent } from 'board/board-overview/board-overview.component';
import { CreateBoardModule } from 'board/create-board.module';
import { BoardOverviewEditModalComponent } from 'board/board-overview/board-overview-edit-modal/board-overview-edit-modal.component';
import { BoardOverviewDeleteModalComponent } from 'board/board-overview/board-overview-delete-modal/board-overview-delete-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TagModule } from 'tag/tag.module';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        // non-core

        // internal
        MatSidenavModule,
        MatInputModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatButtonToggleModule,
        CreateBoardModule,
        TagModule,
    ],
    declarations: [BoardOverviewComponent, BoardOverviewEditModalComponent, BoardOverviewDeleteModalComponent],
    providers: [],
    exports: [BoardOverviewComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BoardOverviewModule {}
