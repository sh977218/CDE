import { Component, EventEmitter, Inject, Input, Output, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import { Http } from "@angular/http";

@Component({
    selector: "cde-reference-document",
    providers: [NgbActiveModal],
    templateUrl: "./referenceDocument.component.html"
})
export class ReferenceDocumentComponent {
    @ViewChild("newReferenceDocumentContent") public newReferenceDocumentContent: NgbModalModule;
    @Output() onEltChange = new EventEmitter();
    @Output() save = new EventEmitter();
    @Output() remove = new EventEmitter();
    @Input() public elt: any;
    public newReferenceDocument: any = {};
    public modalRef: NgbModalRef;

    constructor(private http: Http,
                private alert: AlertService,
                @Inject("isAllowedModel") public isAllowedModel,
                public modalService: NgbModal) {
    }

    openNewReferenceDocumentModal() {
        this.modalRef = this.modalService.open(this.newReferenceDocumentContent, {size: "lg"});
        this.modalRef.result.then(() => {
            this.newReferenceDocument = {};
        }, () => {
        });
    }

    addNewReferenceDocument() {
        this.elt.referenceDocuments.push(this.newReferenceDocument);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Reference document added. Save to confirm.");
            this.modalRef.close();
        } else {
            this.onEltChange.emit({type: "success", message: "Reference document added."});
            this.modalRef.close();
        }
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Reference document removed. Save to confirm.");
        } else {
            this.onEltChange.emit({type: "success", message: "Reference document removed."});
            this.modalRef.close();
        }
    }

}
