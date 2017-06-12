import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CdeModule } from "../../cde/public/cde.module";
import { SearchModule } from "search";

import { BoardFormSummaryListComponent } from "./components/searchResults/boardFormSummaryList.component";
import { BoardFormSummaryListContentComponent } from "./components/searchResults/boardFormSummaryListContent.component";
import { BoardService } from "./components/searchResults/board.service";
import { CreateBoardComponent } from "./components/createBoard/createBoard.component";
import { LinkedBoardsComponent } from "./components/linkedBoards/linkedBoards.component";
import { ListSortComponent } from "./components/searchResults/listSort.component";
import { MyBoardsService } from "./myBoards.service";
import { PinBoardAccordionComponent } from "./components/searchResults/pinBoardAccordion.component";
import { PinModalComponent } from "./components/pinModal/pinModal.component";

@NgModule({
    declarations: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        CreateBoardComponent,
        LinkedBoardsComponent,
        ListSortComponent,
        PinBoardAccordionComponent,
        PinModalComponent,
    ],
    entryComponents: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        CreateBoardComponent,
        LinkedBoardsComponent
    ],
    providers: [BoardService, MyBoardsService],
    imports: [CommonModule, FormsModule, NgbModule, SearchModule],
    exports: [
        LinkedBoardsComponent,
        ListSortComponent,
        PinBoardAccordionComponent,
        PinModalComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {

}
