import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AdminItemModule } from 'adminItem/adminItem.module';
import { CreateFormFromBoardComponent } from 'board/createFormFromBoard/createFormFromBoard.component';
import { ListSortComponent } from 'board/listView/listSort.component';
import { UnpinBoardComponent } from 'board/listView/unpinBoard.component';
import { MyBoardsService } from 'board/myBoards.service';
import { PinBoardSnackbarComponent } from 'board/snackbar/pinBoardSnackbar.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { TagModule } from 'tag/tag.module';
import { CreateBoardModule } from 'board/create-board.module';
import { BoardOverviewModule } from 'board/board-overview.module';
import { CreateFormFromBoardModalComponent } from 'board/createFormFromBoard/create-form-from-board-modal/create-form-from-board-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatButtonToggleModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        RouterModule,
        // non-core
        NonCoreModule,
        // internal
        SearchModule,
        AdminItemModule,
        CreateBoardModule,
        BoardOverviewModule,
        TagModule,
    ],
    declarations: [
        CreateFormFromBoardComponent,
        CreateFormFromBoardModalComponent,
        ListSortComponent,
        PinBoardSnackbarComponent,
        UnpinBoardComponent,
    ],
    providers: [MyBoardsService],
    exports: [
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinBoardSnackbarComponent,
        UnpinBoardComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BoardModule {}
