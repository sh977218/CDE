import { Component, OnInit, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Board } from 'shared/models.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html'
})
export class BoardViewTemplateComponent implements OnInit {
    @Input() board: any;
    @Input() canEdit!: boolean;
    @Input() headerLink = true;
    @Output() saved = new EventEmitter<Board>();
    @Output() deleted = new EventEmitter();
    @Output() headerClicked = new EventEmitter();
    @ViewChild('editBoardContent', {static: true}) editBoardContent!: TemplateRef<any>;
    @ViewChild('deleteBoardContent', {static: true}) deleteBoardContent!: TemplateRef<any>;
    boardTitle = 'CDE(s)';
    dialogRef!: MatDialogRef<TemplateRef<any>>;

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

    save(board: Board) {
        this.dialogRef.close();
        this.saved.emit(board);
    }

    delete(board: Board) {
        this.dialogRef.close();
        this.deleted.emit(board);
    }

    clickHeader(board: Board) {
        if (this.headerClicked) { this.headerClicked.emit(board); }
    }

    onBoardShareStatusChange($event: MatButtonToggleChange) {
        this.board.shareStatus = $event.value;
    }
}
