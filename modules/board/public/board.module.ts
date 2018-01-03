import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from 'ng2-select2';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { BoardViewTemplateComponent } from 'board/public/components/boardViewTemplate/boardViewTemplate.component';
import { CreateBoardComponent } from "./components/createBoard/createBoard.component";
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { LinkedBoardsComponent } from "./components/linkedBoards/linkedBoards.component";
import { ListSortComponent } from "./components/listView/listSort.component";
import { MyBoardsService } from "./myBoards.service";
import { PinBoardComponent } from "./components/pins/pinBoard.component";
import { PinBoardModalComponent } from "./components/pins/pinBoardModal.component";
import { PinQuickboardComponent } from "./components/pins/pinQuickboard.component";
import { UnpinBoardComponent } from "./components/listView/unpinBoard.component";
import { WidgetModule } from "widget/widget.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule,
        Select2Module,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
    ],
    declarations: [
        BoardViewTemplateComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
        LinkedBoardsComponent,
        ListSortComponent,
        PinBoardComponent,
        PinBoardModalComponent,
        PinQuickboardComponent,
        UnpinBoardComponent,
    ],
    entryComponents: [
        PinBoardModalComponent,
    ],
    providers: [
        MyBoardsService,
    ],
    exports: [
        BoardViewTemplateComponent,
        CreateBoardComponent,
        CreateFormFromBoardComponent,
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
