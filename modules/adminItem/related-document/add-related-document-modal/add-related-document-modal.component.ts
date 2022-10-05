import { Component } from '@angular/core';
import { ReferenceDocument } from 'shared/models.model';

@Component({
    templateUrl: './add-related-document-modal.component.html',
})
export class AddRelatedDocumentModalComponent {
    newReferenceDocument: ReferenceDocument = new ReferenceDocument();
}
