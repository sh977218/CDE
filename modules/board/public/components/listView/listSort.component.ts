import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';
import { AlertService } from 'system/public/components/alert/alert.service';
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

    constructor(private boardListService: BoardListService,
                private http: Http,
                private alert: AlertService
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
            this.alert.addAlert('danger', response.data);
            this.boardListService.reload.emit();
        });
    }
}
