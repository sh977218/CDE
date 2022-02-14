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
import { BoardViewTemplateComponent } from 'board/public/components/boardViewTemplate/boardViewTemplate.component';
import { CreateBoardComponent } from 'board/public/components/createBoard/createBoard.component';
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { ListSortComponent } from 'board/public/components/listView/listSort.component';
import { UnpinBoardComponent } from 'board/public/components/listView/unpinBoard.component';
import { MyBoardsService } from 'board/public/myBoards.service';
import { PinBoardComponent } from 'board/public/components/pins/pinBoard.component';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { TagModule } from 'tag/tag.module';


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
        TagModule
    ],
    declarations: [
        BoardViewTemplateComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
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
        UnpinBoardComponent,
    ],
    entryComponents: [
        PinBoardModalComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}
