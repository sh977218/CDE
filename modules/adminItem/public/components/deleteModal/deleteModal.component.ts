import { Component, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'cde-delete-modal',
    templateUrl: './deleteModal.component.html'
})
export class DeleteModalComponent {
    @Output() confirm = new EventEmitter();
    modalRef: NgbModalRef;
    @ViewChild('deleteElementContent') deleteElementContent: NgbModalModule;

    constructor(public modalService: NgbModal) {
    }

    openDeleteModal() {
        this.modalRef = this.modalService.open(this.deleteElementContent, {container: 'body', size: 'sm'});
    }

    confirmDelete() {
        this.modalRef.close();
        this.confirm.emit();
    }
}
