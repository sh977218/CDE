import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardViewTemplateComponent } from 'board/boardViewTemplate/boardViewTemplate.component';
import { CreateFormFromBoardComponent } from 'board/createFormFromBoard/createFormFromBoard.component';
import { ListSortComponent } from 'board/listView/listSort.component';
import { UnpinBoardComponent } from 'board/listView/unpinBoard.component';
import { MyBoardsService } from 'board/myBoards.service';
import { PinBoardSnackbarComponent } from 'board/snackbar/pinBoardSnackbar.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { TagModule } from 'tag/tag.module';
import { CreateBoardModule } from 'board/create-board.module';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';
import { PinToBoardComponent } from 'board/pin-to-board/pin-to-board.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
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
        TagModule
    ],
    declarations: [
        BoardViewTemplateComponent,
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinToBoardComponent,
        PinToBoardModalComponent,
        PinBoardSnackbarComponent,
        UnpinBoardComponent,
    ],
    providers: [
        MyBoardsService,
    ],
    exports: [
        BoardViewTemplateComponent,
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinToBoardComponent,
        PinToBoardModalComponent,
        PinBoardSnackbarComponent,
        UnpinBoardComponent,
    ],
    entryComponents: [
        PinToBoardModalComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}