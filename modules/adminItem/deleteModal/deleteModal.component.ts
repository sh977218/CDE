import { Component, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-delete-modal',
    templateUrl: './deleteModal.component.html'
})
export class DeleteModalComponent {
    @Output() confirm = new EventEmitter();
    @ViewChild('deleteElementContent', {static: true}) deleteElementContent!: TemplateRef<any>;

    constructor(public dialog: MatDialog) {}

    openDeleteModal() {
        this.dialog.open(this.deleteElementContent).afterClosed().subscribe(res => {
            if (res) {
                this.confirm.emit();
            }
        });
    }
}