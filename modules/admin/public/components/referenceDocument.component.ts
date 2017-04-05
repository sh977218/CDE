import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { Select2OptionData } from "ng2-select2";

@Component({
    selector: "cde-admin-item-reference-document",
    providers: [NgbActiveModal],
    templateUrl: "./referenceDocument.component.html"
})
export class ReferenceDocumentComponent {
    @ViewChild("newReferenceDocumentContent") public newReferenceDocumentContent: NgbModalModule;
    @Input() public elt: any;
    public newReferenceDocument: any = {};
    public modalRef: NgbModalRef;

    constructor(@Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) {
    }

    openNewReferenceDocumentModal() {
        this.modalRef = this.modalService.open(this.newReferenceDocumentContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newReferenceDocument = {};
        });
    }

    addNewReferenceDocument() {
        this.elt.referenceDocuments.push(this.newReferenceDocument);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Reference Document added. Save to confirm.");
            this.modalRef.close();
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Reference Document Added");
                this.modalRef.close();
            });
        }
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Reference Document removed. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Reference Document Removed");
            });
        }
    }

    saveReferenceDocument() {
        this.elt.$save(newElt => {
            this.elt = newElt;
            this.alert.addAlert("success", "Saved");
        });
    };

}
