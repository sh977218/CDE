import { Component, Input } from "@angular/core";
import { SummaryComponent } from "search";
import { BoardService } from "../../../../board/public/components/searchResults/board.service";


@Component({
    selector: "cde-board-cde-summary-list-content",
    templateUrl: "./boardCdeSummaryListContent.component.html",
})
export class BoardCdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'cde';

    constructor(public boardService: BoardService) {}
}
