import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BoardCdeSummaryListContentComponent } from 'cde/listView/boardCdeSummaryListContent.component';
import { BoardListService } from 'board/listView/boardList.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-board-cde-summary-list',
    templateUrl: './boardCdeSummaryList.component.html'
})
export class BoardCdeSummaryListComponent implements OnChanges, OnInit {
    @Input() board: any;
    @Input() currentPage!: number;
    @Input() elts!: DataElement[];
    @Input() totalItems!: number;
    @Output() reload: EventEmitter<any> = new EventEmitter();

    summaryComponent = BoardCdeSummaryListContentComponent;

    doCheck() {
        // TODO: remove DoCheck when OnChanges inputs is implemented for Dynamic Components
        if (this.board !== this.boardListService.board) { this.boardListService.board = this.board; }
        if (this.currentPage !== this.boardListService.currentPage) { this.boardListService.currentPage = this.currentPage; }
        if (this.totalItems !== this.boardListService.totalItems) { this.boardListService.totalItems = this.totalItems; }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.board) { this.boardListService.board = this.board; }
        if (changes.currentPage) { this.boardListService.currentPage = this.currentPage; }
        if (changes.totalItems) { this.boardListService.totalItems = this.totalItems; }
        this.doCheck();
    }

    ngOnInit() {
        this.boardListService.reload.subscribe(() => this.reload.emit());
        this.doCheck();
    }

    constructor(private boardListService: BoardListService) {}
}
