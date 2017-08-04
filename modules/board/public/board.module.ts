import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SearchModule } from "search";

import { BoardService } from "./components/searchResults/board.service";
import { CreateBoardComponent } from "./components/createBoard/createBoard.component";
import { LinkedBoardsComponent } from "./components/linkedBoards/linkedBoards.component";
import { ListSortComponent } from "./components/searchResults/listSort.component";
import { MyBoardsService } from "./myBoards.service";
import { PinAccordionComponent } from "./components/searchResults/pinAccordion.component";
import { PinBoardAccordionComponent } from "./components/searchResults/pinBoardAccordion.component";
import { PinModalComponent } from "./components/pinModal/pinModal.component";
import { PinQuickboardComponent } from "./components/searchResults/pinQuickboard.component";
import { CreateFormFromBoardComponent } from 'board/public/components/createFormFromBoard.component';
import { AdminItemModule } from 'adminItem/public/adminItem.module';

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
        LinkedBoardsComponent,
        ListSortComponent,
        PinAccordionComponent,
        PinBoardAccordionComponent,
        PinModalComponent,
        PinQuickboardComponent,
        CreateFormFromBoardComponent,
    ],
    entryComponents: [
        CreateBoardComponent,
        LinkedBoardsComponent,
        CreateFormFromBoardComponent
    ],
    providers: [
        BoardService,
        MyBoardsService
    ],
    exports: [
        LinkedBoardsComponent,
        ListSortComponent,
        PinAccordionComponent,
        PinBoardAccordionComponent,
        PinModalComponent,
        PinQuickboardComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}
