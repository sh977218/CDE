import { Component, OnInit, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html'
})
export class BoardViewTemplateComponent implements OnInit {
    @ViewChild('editBoardContent') editBoardContent: TemplateRef<any>;
    @ViewChild('deleteBoardContent') deleteBoardContent: TemplateRef<any>;
    @Input() board: any;
    @Input() canEdit: boolean;
    @Input() headerLink = true;

    boardTitle = 'CDE(s)';

    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();
    @Output() onHeaderClick = new EventEmitter();
    dialogRef: MatDialogRef<TemplateRef<any>>;

    constructor(public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.boardTitle = this.board.type === 'form' ? 'Form(s)' : 'CDE(s)';
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
        if (this.onHeaderClick) { this.onHeaderClick.emit(board); }
    }

    onBoardShareStatusChange($event) {
        this.board.shareStatus = $event.value;
    }

}
