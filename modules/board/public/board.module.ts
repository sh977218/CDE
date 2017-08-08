import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CreateBoardComponent } from "./components/createBoard/createBoard.component";
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { EltsCompareDirective } from 'board/public/upgrade-components';
import { LinkedBoardsComponent } from "./components/linkedBoards/linkedBoards.component";
import { ListSortComponent } from "./components/listView/listSort.component";
import { MyBoardsService } from "./myBoards.service";
import { PinBoardComponent } from "./components/pins/pinBoard.component";
import { PinBoardModalComponent } from "./components/pins/pinBoardModal.component";
import { PinQuickboardComponent } from "./components/pins/pinQuickboard.component";
import { SearchModule } from "search/search.module";
import { UnpinBoardComponent } from "./components/listView/unpinBoard.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        // internal
        SearchModule,
        AdminItemModule,
    ],
    declarations: [
        CreateBoardComponent,
        EltsCompareDirective,
        LinkedBoardsComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        CreateFormFromBoardComponent,
        UnpinBoardComponent,
    ],
    entryComponents: [
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        LinkedBoardsComponent,
        PinBoardModalComponent,
    ],
    providers: [
        MyBoardsService,
    ],
    exports: [
        LinkedBoardsComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        UnpinBoardComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}
