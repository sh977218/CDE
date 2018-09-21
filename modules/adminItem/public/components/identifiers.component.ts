import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-identifiers',
    templateUrl: './identifiers.component.html'
})
export class IdentifiersComponent {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newIdentifierContent') newIdentifierContent: TemplateRef<any>;
    newIdentifier: any = {};
    dialogRef: MatDialogRef<TemplateRef<any>>;

    constructor(public dialog: MatDialog) {}

    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        this.onEltChange.emit();
        this.dialogRef.close();
    }

    openNewIdentifierModal() {
        this.dialog.open(this.newIdentifierContent, {width: '800px'}).afterClosed().subscribe(() => {
                this.newIdentifier = {};
            }, () => {}
        );
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        this.onEltChange.emit();
    }
}
