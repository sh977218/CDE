import { Component, Inject, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModalRef, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-admin-item-ids",
    providers: [NgbActiveModal],
    templateUrl: "./identifiers.component.html"
})


export class IdentifiersComponent {

    @ViewChild("newIdentifierContent") public newIdentifierContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    public newIdentifier: any = {};

    constructor(public modalService: NgbModal,
                private http: Http,
                private alert: AlertService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openNewIdentifierModal() {
        this.modalRef = this.modalService.open(this.newIdentifierContent, {size: "lg"});
        this.modalRef.result.then(() => this.newIdentifier = {}, () => {
        });
    }

    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier added. Save to confirm.");
            this.modalRef.close();
        } else {
            let url;
            if (this.elt.elementType === "cde")
                url = "/dataElement/tinyId/";
            if (this.elt.elementType === "form")
                url = "/form/tinyId/";
            this.http.put(url + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Identifier added.");
                    this.modalRef.close();
                }
            }, err => this.alert.addAlert("danger", err));
        }
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier removed. Save to confirm.");
        } else {
            let url;
            if (this.elt.elementType === "cde")
                url = "/dataElement/tinyId/";
            if (this.elt.elementType === "form")
                url = "/form/tinyId/";
            this.http.put(url + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Identifier removed.");
                    this.modalRef.close();
                }
            }, err => this.alert.addAlert("danger", err));
        }
    }


}
