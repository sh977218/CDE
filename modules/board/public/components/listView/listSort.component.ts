import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { BoardListService } from 'board/public/components/listView/boardList.service';
import { Elt } from 'shared/models.model';


@Component({
    selector: 'cde-list-sort',
    templateUrl: './listSort.component.html',
})
export class ListSortComponent {
    @Input() currentPage: number;
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() totalItems: number;

    pinModal: any;

    constructor(
        private alert: AlertService,
        private boardListService: BoardListService,
        private http: HttpClient,
    ) {}

    moveUp(id) {
        this.movePin('/server/board/pin/move/up', id);
    }

    moveDown(id) {
        this.movePin('/server/board/pin/move/down', id);
    }

    moveTop(id) {
        this.movePin('/server/board/pin/move/top', id);
    }

    movePin(endPoint, pinId) {
        this.http.post(endPoint, {boardId: this.boardListService.board._id, tinyId: pinId}, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Saved');
            this.boardListService.reload.emit();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            this.boardListService.reload.emit();
        });
    }
}
