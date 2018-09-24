import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html'
})
export class BoardViewTemplateComponent {
    @ViewChild('editBoardContent') editBoardContent: TemplateRef<any>;
    @ViewChild('deleteBoardContent') deleteBoardContent: TemplateRef<any>;
    @Input() board: any;
    @Input() canEdit: boolean;
    @Input() headerLink: boolean = true;

    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();
    @Output() onHeaderClick = new EventEmitter();
    dialogRef: MatDialogRef<TemplateRef<any>>;

    constructor(public dialog: MatDialog) {
    }

    openEditBoardModal() {
        this.dialogRef = this.dialog.open(this.editBoardContent);
    }

    openDeleteBoardModal() {
        this.dialogRef = this.dialog.open(this.deleteBoardContent);
    }

    save(board) {
        this.dialogRef.close();
        this.onSave.emit(board);
    }

    delete(board) {
        this.dialogRef.close();
        this.onDelete.emit(board);
    }

    clickHeader(board) {
        if (this.onHeaderClick) this.onHeaderClick.emit(board);
    }

    onBoardShareStatusChange($event) {
        this.board.shareStatus = $event.value;
    }
}