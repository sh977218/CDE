import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { BoardFormSummaryListContentComponent } from "./boardFormSummaryListContent.component";
import { BoardService } from "../../../../board/public/components/searchResults/board.service";
import { CdeForm } from "../../../../form/public/form.model";

@Component({
    selector: "cde-board-form-summary-list",
    templateUrl: "./boardFormSummaryList.component.html",
})
export class BoardFormSummaryListComponent implements OnChanges, OnInit {
    @Input() board: any;
    @Input() forms: CdeForm[];
    @Input() currentPage: number;
    @Input() totalItems: number;
    @Output() reload: EventEmitter<any> = new EventEmitter();

    summaryComponent: any = BoardFormSummaryListContentComponent;

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
