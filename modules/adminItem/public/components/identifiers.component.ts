import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';


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

    constructor(public dialog: MatDialog) {}

    openNewIdentifierModal() {
        this.dialog.open(this.newIdentifierContent, {width: '800px'}).afterClosed().subscribe(
            res => {
                if (res) {
                    this.elt.ids.push(this.newIdentifier);
                    this.onEltChange.emit();
                }
                this.newIdentifier = {};
            }, () => {}
            );
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        this.onEltChange.emit();
    }
}
