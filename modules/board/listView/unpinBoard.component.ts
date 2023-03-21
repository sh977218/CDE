import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { BoardListService } from 'board/listView/boardList.service';
import { Elt } from 'shared/models.model';

@Component({
    selector: 'cde-unpin-board',
    template: `
        <mat-icon
            svgIcon="thumb_tack"
            id="unpin_{{ eltIndex }}"
            class="fake-button"
            role="button"
            tabindex="0"
            (click)="unpin()"
            title="Unpin from Board"
            style="transform: rotate(90deg)"
        >
        </mat-icon>
    `,
})
export class UnpinBoardComponent {
    @Input() elt!: Elt;
    @Input() eltIndex!: number;

    constructor(
        private alert: AlertService,
        private boardListService: BoardListService,
        private http: HttpClient,
        public userService: UserService
    ) {}

    unpin() {
        this.http
            .post(
                '/server/board/deletePin/',
                {
                    boardId: this.boardListService.board.id,
                    tinyId: this.elt.tinyId,
                },
                { responseType: 'text' }
            )
            .subscribe(
                () => {
                    this.alert.addAlert('success', 'Unpinned.');
                    this.boardListService.reload.emit();
                },
                err => {
                    this.alert.httpErrorMessageAlert(err);
                    this.boardListService.reload.emit();
                }
            );
    }
}
