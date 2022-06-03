import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { BoardListService } from 'board/listView/boardList.service';
import { Elt } from 'shared/models.model';

@Component({
    selector: 'cde-list-sort',
    templateUrl: './listSort.component.html',
})
export class ListSortComponent {
    @Input() currentPage!: number;
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    @Input() totalItems!: number;

    pinModal: any;

    constructor(
        private alert: AlertService,
        private boardListService: BoardListService,
        private http: HttpClient,
    ) {}

    moveUp(id: string) {
        this.movePin('/server/board/pinMoveUp', id);
    }

    moveDown(id: string) {
        this.movePin('/server/board/pinMoveDown', id);
    }

    moveTop(id: string) {
        this.movePin('/server/board/pinMoveTop', id);
    }

    movePin(endPoint: string, pinId: string) {
        this.http.post(endPoint, {boardId: this.boardListService.board.id, tinyId: pinId}, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Saved');
            this.boardListService.reload.emit();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            this.boardListService.reload.emit();
        });
    }
}
