import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { DataElement } from 'shared/de/dataElement.model';
import { ReferenceDocument } from 'shared/models.model';


@Component({
    selector: "cde-reference-document",
    providers: [NgbActiveModal],
    templateUrl: "./referenceDocument.component.html",
    styles: [`
        dd {
            min-height: 20px;
        }`]
})
export class ReferenceDocumentComponent {
    @Input() canEdit: boolean = false;
    @Input() elt: DataElement;
    @Output() onEltChange = new EventEmitter();
    @ViewChild("newReferenceDocumentContent") public newReferenceDocumentContent: NgbModalModule;
    newReferenceDocument: ReferenceDocument = new ReferenceDocument();
    modalRef: NgbModalRef;

    constructor(
        private modalService: NgbModal
    ) {
    }

    addNewReferenceDocument() {
        this.elt.referenceDocuments.push(this.newReferenceDocument);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    openNewReferenceDocumentModal() {
        this.modalRef = this.modalService.open(this.newReferenceDocumentContent, {size: "lg"});
        this.modalRef.result.then(() => {
            this.newReferenceDocument = new ReferenceDocument();
        }, () => {
        });
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        this.onEltChange.emit();
        this.modalRef.close();
    }
}
