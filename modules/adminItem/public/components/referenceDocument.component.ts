import { Component, EventEmitter, Inject, Input, Output, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import { Http } from "@angular/http";
import { DataElement } from 'cde/public/dataElement.model';
import { ReferenceDocument } from 'core/public/models.model';

@Component({
    selector: "cde-reference-document",
    providers: [NgbActiveModal],
    templateUrl: "./referenceDocument.component.html"
})
export class ReferenceDocumentComponent {
    @ViewChild("newReferenceDocumentContent") public newReferenceDocumentContent: NgbModalModule;
    @Output() onEltChange = new EventEmitter();
    @Input() public elt: DataElement;
    public newReferenceDocument: ReferenceDocument = new ReferenceDocument();
    public modalRef: NgbModalRef;

    constructor(private modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openNewReferenceDocumentModal() {
        this.modalRef = this.modalService.open(this.newReferenceDocumentContent, {size: "lg"});
        this.modalRef.result.then(() => {
            this.newReferenceDocument = new ReferenceDocument();
        }, () => {
        });
    }

    addNewReferenceDocument() {
        this.elt.referenceDocuments.push(this.newReferenceDocument);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        this.onEltChange.emit();
        this.modalRef.close();
    }

}
