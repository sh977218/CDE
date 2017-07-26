import { Component, EventEmitter, Inject, Input, Output, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import { Http } from "@angular/http";

@Component({
    selector: "cde-admin-item-reference-document",
    providers: [NgbActiveModal],
    templateUrl: "./referenceDocument.component.html"
})
export class ReferenceDocumentComponent {
    @ViewChild("newReferenceDocumentContent") public newReferenceDocumentContent: NgbModalModule;
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
            let url;
            if (this.elt.elementType === "cde")
                url = "/de/";
            if (this.elt.elementType === "form")
                url = "/form/";
            this.http.put(url + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Reference document added");
                    this.modalRef.close();
                }
            }, err => this.alert.addAlert("danger", err));
        }
    }

    removeReferenceDocumentByIndex(index) {
        this.elt.referenceDocuments.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Reference document removed. Save to confirm.");
        } else {
            let url;
            if (this.elt.elementType === "cde")
                url = "/de/";
            if (this.elt.elementType === "form")
                url = "/form/";
            this.http.put(url + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Reference document removed.");
                    this.modalRef.close();
                }
            }, err => this.alert.addAlert("danger", err));
        }
    }

}
