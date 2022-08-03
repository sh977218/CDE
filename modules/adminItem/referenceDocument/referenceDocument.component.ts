import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';
import { MatDialog } from '@angular/material/dialog';
import {
    AddReferenceDocumentModalComponent
} from 'adminItem/referenceDocument/add-reference-document-modal/add-reference-document-modal.component';

@Component({
    selector: 'cde-reference-document',
    templateUrl: './referenceDocument.component.html',
    styles: [`
      dd {
        min-height: 20px;
      }`
    ]
})
export class ReferenceDocumentComponent {
    @Input() canEdit = false;
    @Input() elt!: DataElement;
    @Output() eltChange = new EventEmitter();

    constructor(private dialog: MatDialog) {
    }

    openNewReferenceDocumentModal() {
        this.dialog.open(AddReferenceDocumentModalComponent, {width: '800px'})
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
