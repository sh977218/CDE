import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-datasets',
    templateUrl: './datasets.component.html'
})

export class DatasetsComponent {
    @ViewChild('datasetsContent', {static: true}) datasetsContent!: TemplateRef<any>;
    @Input() public elt: any;
    dialogRef?: MatDialogRef<TemplateRef<any>>

    constructor(public dialog: MatDialog) {}

    openDatasetsModal() {
        this.dialogRef = this.dialog.open(this.datasetsContent, {width: '800px'});
    }
}
