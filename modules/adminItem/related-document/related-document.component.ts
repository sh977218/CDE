import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';
import { MatDialog } from '@angular/material/dialog';
import { AddRelatedDocumentModalComponent } from 'adminItem/related-document/add-related-document-modal/add-related-document-modal.component';

@Component({
    selector: 'cde-related-document',
    templateUrl: './related-document.component.html',
})
export class RelatedDocumentComponent {
    @Input() canEdit = false;
    @Input() elt!: DataElement;
    @Output() eltChange = new EventEmitter();

    constructor(private dialog: MatDialog) {}

    openNewReferenceDocumentModal() {
        this.dialog
            .open(AddRelatedDocumentModalComponent, { width: '800px' })
            .afterClosed()
            .subscribe(newReferenceDocument => {
                if (newReferenceDocument) {
                    this.elt.referenceDocuments.push(newReferenceDocument);
                    this.eltChange.emit();
                }
            });
    }

    removeReferenceDocumentByIndex(index: number) {
        this.elt.referenceDocuments.splice(index, 1);
        this.eltChange.emit();
    }
}
