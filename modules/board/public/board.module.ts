import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardViewTemplateComponent } from 'board/public/components/boardViewTemplate/boardViewTemplate.component';
import { CreateBoardComponent } from './components/createBoard/createBoard.component';
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { ListSortComponent } from './components/listView/listSort.component';
import { MyBoardsService } from './myBoards.service';
import { PinBoardComponent } from './components/pins/pinBoard.component';
import { PinBoardModalComponent } from './components/pins/pinBoardModal.component';
import { PinQuickboardComponent } from './components/pins/pinQuickboard.component';
import { UnpinBoardComponent } from './components/listView/unpinBoard.component';

import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { TagModule } from 'tag/tag.module';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        RouterModule,
        // non-core
        NonCoreModule,
        // internal
        SearchModule,
        AdminItemModule,
        TagModule
    ],
    declarations: [
        BoardViewTemplateComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        UnpinBoardComponent,
    ],
    providers: [
        MyBoardsService,
    ],
    exports: [
        BoardViewTemplateComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        UnpinBoardComponent,
    ],
    entryComponents: [
        PinBoardModalComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}
