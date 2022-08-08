import { Component } from '@angular/core';
import { ReferenceDocument } from 'shared/models.model';

@Component({
    templateUrl: './add-reference-document-modal.component.html'
})
export class AddReferenceDocumentModalComponent {
    newReferenceDocument: ReferenceDocument = new ReferenceDocument();
}
