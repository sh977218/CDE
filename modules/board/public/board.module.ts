import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CreateBoardComponent } from "./components/createBoard/createBoard.component";
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { LinkedBoardsComponent } from "./components/linkedBoards/linkedBoards.component";
import { ListSortComponent } from "./components/listView/listSort.component";
import { MyBoardsService } from "./myBoards.service";
import { PinBoardComponent } from "./components/pins/pinBoard.component";
import { PinBoardModalComponent } from "./components/pins/pinBoardModal.component";
import { PinQuickboardComponent } from "./components/pins/pinQuickboard.component";
import { SearchModule } from "search/search.module";
import { UnpinBoardComponent } from "./components/listView/unpinBoard.component";
import { BoardViewTemplateComponent } from "./components/boardViewTemplate/boardViewTemplate.component";
import { MyBoardsComponent } from "./components/myBoards/myBoards.component";
import { WidgetModule } from "../../widget/widget.module";
import { BoardViewComponent } from "./components/boardView/boardView.component";
import { DiscussModule } from "../../discuss/discuss.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        // internal
        AdminItemModule,
        DiscussModule,
        SearchModule,
        WidgetModule,
    ],
    declarations: [
        BoardViewComponent,
        BoardViewTemplateComponent,
        CreateBoardComponent,
        LinkedBoardsComponent,
        ListSortComponent,
        MyBoardsComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        CreateFormFromBoardComponent,
        UnpinBoardComponent,
    ],
    entryComponents: [
        BoardViewComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        LinkedBoardsComponent,
        MyBoardsComponent,
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
