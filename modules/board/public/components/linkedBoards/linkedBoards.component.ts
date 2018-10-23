import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-linked-boards',
    templateUrl: 'linkedBoards.component.html',
    styles: [`
        .linkedBoardDiv .card {
        width:100%!important;
            }
    `]
})
export class LinkedBoardsComponent {
    @Input() elt: any;
    @ViewChild('linkedBoardsContent') linkedBoardsContent: TemplateRef<any>;
    boards: any[];

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog) {
    }

    openLinkedBoardsModal() {
        this.http.get<any>('/server/board/byPinTinyId/' + this.elt.tinyId).subscribe(response => {
            if (response.error) {
                this.boards = [];
                this.alert.addAlert('danger', 'Error retrieving boards.');
            } else {
                this.boards = response;
                this.dialog.open(this.linkedBoardsContent, {width: '800px'});
            }
        });
    }
}
