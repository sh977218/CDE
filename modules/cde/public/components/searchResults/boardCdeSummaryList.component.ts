import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { BoardCdeSummaryListContentComponent } from "./boardCdeSummaryListContent.component";
import { BoardService } from "../../../../board/public/components/searchResults/board.service";

@Component({
    selector: "cde-board-cde-summary-list",
    templateUrl: "./boardCdeSummaryList.component.html",
})
export class BoardCdeSummaryListComponent implements OnChanges, OnInit {
    @Input() board: any;
    @Input() cdes: any[];
    @Input() currentPage: number;
    @Input() totalItems: number;
    @Output() reload: EventEmitter<any> = new EventEmitter();

    summaryComponent: any = BoardCdeSummaryListContentComponent;

    constructor(private boardService: BoardService) {}

    ngOnInit() {
        this.boardService.reload.subscribe(() => this.reload.emit());
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.board)
            this.boardService.board = this.board;
        if (changes.currentPage)
            this.boardService.currentPage = this.currentPage;
        if (changes.totalItems)
            this.boardService.totalItems = this.totalItems;
    }
}
