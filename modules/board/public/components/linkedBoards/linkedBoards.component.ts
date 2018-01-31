import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';


@Component({
    selector: 'cde-linked-boards',
    providers: [NgbActiveModal],
    templateUrl: 'linkedBoards.component.html'
})
export class LinkedBoardsComponent {
    @Input() elt: any;
    @ViewChild('linkedBoardsContent') linkedBoardsContent: NgbModalModule;
    boards: any[];
    modalRef: NgbModalRef;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
    ) {
    };

    openLinkedBoardsModal() {
        this.http.get<any>('/deBoards/' + this.elt.tinyId).subscribe(response => {
            if (response.error) {
                this.boards = [];
                this.alert.addAlert('danger', 'Error retrieving boards.');
            } else {
                this.boards = response;
                this.modalRef = this.modalService.open(this.linkedBoardsContent, {size: 'lg'});
            }
        });
    }
}
