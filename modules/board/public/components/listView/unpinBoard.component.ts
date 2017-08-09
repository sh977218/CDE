import { Component, Inject, Input } from '@angular/core';
import { Http } from '@angular/http';
import { AlertService } from 'system/public/components/alert/alert.service';
import { BoardListService } from 'board/public/components/listView/boardList.service';

@Component({
    selector: 'cde-unpin-board',
    templateUrl: './unpinBoard.component.html',
})
export class UnpinBoardComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    pinModal: any;

    constructor(private http: Http,
                private boardListService: BoardListService,
                private alert: AlertService,
                @Inject('userResource') public userService) {}

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
