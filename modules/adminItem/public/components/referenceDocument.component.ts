import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';
import { ReferenceDocument } from 'shared/models.model';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-reference-document',
    templateUrl: './referenceDocument.component.html',
    styles: [`
        dd {
            min-height: 20px;
        }`]
})
export class ReferenceDocumentComponent {
    @Input() canEdit = false;
    @Input() elt: DataElement;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newReferenceDocumentContent') public newReferenceDocumentContent: TemplateRef<any>;
    newReferenceDocument: ReferenceDocument = new ReferenceDocument();
    modalRef: MatDialogRef<TemplateRef<any>>;

    constructor(private dialog: MatDialog) {}

    addNewReferenceDocument() {
        this.elt.referenceDocuments.push(this.newReferenceDocument);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    openNewReferenceDocumentModal() {
        this.modalRef = this.dialog.open(this.newReferenceDocumentContent, {width: '800px'});
        this.modalRef.afterClosed().subscribe(() => this.newReferenceDocument = new ReferenceDocument(), () => {});
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        this.onEltChange.emit();
    }
}
