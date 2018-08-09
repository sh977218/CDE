import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { BoardListService } from 'board/public/components/listView/boardList.service';
import { Elt } from 'shared/models.model';


@Component({
    selector: 'cde-unpin-board',
    template: `
        <i id="unpin_{{eltIndex}}" class="fa fa-thumb-tack fa-rotate-90 hand-cursor mx-1" title="Unpin from Board"
           role="link" (click)="unpin();"> </i>
    `,
})
export class UnpinBoardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;

    constructor(private alert: AlertService,
                private boardListService: BoardListService,
                private http: HttpClient,
                public userService: UserService) {
    }

    unpin() {
        this.http.post('/server/board/deletePin/', {
            boardId: this.boardListService.board.id,
            tinyId: this.elt.tinyId
        }, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Unpinned.');
            this.boardListService.reload.emit();
        }, (response) => {
            this.alert.addAlert('danger', response.data);
            this.boardListService.reload.emit();
        });
    }
}
