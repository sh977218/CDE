import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { BoardListService } from 'board/public/components/listView/boardList.service';


@Component({
    selector: 'cde-unpin-board',
    templateUrl: './unpinBoard.component.html',
})
export class UnpinBoardComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    pinModal: any;

    constructor(
        private alert: AlertService,
        private boardListService: BoardListService,
        private http: HttpClient,
        public userService: UserService,
    ) {}

    unpin() {
        let url = '/pin/' + this.boardListService.board.type + '/' + this.elt.tinyId + '/' + this.boardListService.board._id;
        this.http.delete(url).subscribe(() => {
            this.alert.addAlert('success', 'Unpinned.');
            this.boardListService.reload.emit();
        }, (response) => {
            this.alert.addAlert('danger', response.data);
            this.boardListService.reload.emit();
        });
    }
}
