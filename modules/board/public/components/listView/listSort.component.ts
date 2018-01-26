import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { BoardListService } from 'board/public/components/listView/boardList.service';


@Component({
    selector: 'cde-list-sort',
    templateUrl: './listSort.component.html',
})
export class ListSortComponent {
    @Input() currentPage: number;
    @Input() totalItems: number;
    @Input() elt: any;
    @Input() eltIndex: any;

    pinModal: any;

    constructor(
        private alert: AlertService,
        private boardListService: BoardListService,
        private http: HttpClient,
    ) {}

    moveUp(id) {
        this.movePin('/board/pin/move/up', id);
    }

    moveDown(id) {
        this.movePin('/board/pin/move/down', id);
    }

    moveTop(id) {
        this.movePin('/board/pin/move/top', id);
    }

    movePin(endPoint, pinId) {
        this.http.post(endPoint, {boardId: this.boardListService.board._id, tinyId: pinId}).subscribe(() => {
            this.alert.addAlert('success', 'Saved');
            this.boardListService.reload.emit();
        }, (response) => {
            this.alert.addAlert('danger', response);
            this.boardListService.reload.emit();
        });
    }
}
