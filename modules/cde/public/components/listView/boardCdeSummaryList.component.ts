import { Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BoardCdeSummaryListContentComponent } from 'cde/public/components/listView/boardCdeSummaryListContent.component';
import { BoardListService } from 'board/public/components/listView/boardList.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-board-cde-summary-list',
    templateUrl: './boardCdeSummaryList.component.html',
    providers: [BoardListService]
})
export class BoardCdeSummaryListComponent implements DoCheck, OnChanges, OnInit {
    @Input() board: any;
    @Input() currentPage!: number;
    @Input() elts!: DataElement[];
    @Input() totalItems!: number;
    @Output() reload: EventEmitter<any> = new EventEmitter();

    summaryComponent = BoardCdeSummaryListContentComponent;

    ngDoCheck() {
        // TODO: remove DoCheck when OnChanges inputs is implemented for Dynamic Components
        if (this.board !== this.boardListService.board) { this.boardListService.board = this.board; }
        if (this.currentPage !== this.boardListService.currentPage) { this.boardListService.currentPage = this.currentPage; }
        if (this.totalItems !== this.boardListService.totalItems) { this.boardListService.totalItems = this.totalItems; }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.board) { this.boardListService.board = this.board; }
        if (changes.currentPage) { this.boardListService.currentPage = this.currentPage; }
        if (changes.totalItems) { this.boardListService.totalItems = this.totalItems; }
    }

    ngOnInit() {
        this.boardListService.reload.subscribe(() => this.reload.emit());
    }

    constructor(private boardListService: BoardListService) {}
}
