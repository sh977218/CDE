import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { Board } from 'shared/models.model';

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
    @ViewChild('linkedBoardsContent') linkedBoardsContent!: TemplateRef<any>;
    boards!: any[];

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog) {
    }

    openLinkedBoardsModal() {
        this.http.get<{error: string} | Board[]>('/server/board/byPinTinyId/' + this.elt.tinyId).subscribe(response => {
            if (!Array.isArray(response) && response.error) {
                this.boards = [];
                this.alert.addAlert('danger', 'Error retrieving boards.');
                return;
            }
            if (Array.isArray(response)) {
                this.boards = response;
                this.dialog.open(this.linkedBoardsContent, {width: '800px'});
            }
        });
    }
}
