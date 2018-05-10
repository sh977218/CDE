import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html'
})
export class BoardViewTemplateComponent {
    @ViewChild('editBoardContent') editBoardContent: NgbModalModule;
    @ViewChild('deleteBoardContent') deleteBoardContent: NgbModalModule;
    @Input() board: any;
    @Input() canEdit: boolean;
    @Input() headerLink: boolean = true;

    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();
    @Output() onHeaderClick = new EventEmitter();
    modalRef: NgbModalRef;

    constructor(public modalService: NgbModal) {
    }

    openEditBoardModal() {
        this.modalRef = this.modalService.open(this.editBoardContent, {size: 'lg'});
    }

    openDeleteBoardModal() {
        this.modalRef = this.modalService.open(this.deleteBoardContent, {size: 'sm'});
    }

    save(board) {
        this.modalRef.close();
        this.onSave.emit(board);
    }

    delete(board) {
        this.modalRef.close();
        this.onDelete.emit(board);
    }

    clickHeader(board) {
        if (this.onHeaderClick) this.onHeaderClick.emit(board);
    }

    onBoardShareStatusChange($event) {
        this.board.shareStatus = $event.value;
    }
}