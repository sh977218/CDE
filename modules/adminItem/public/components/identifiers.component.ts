import { Component, EventEmitter, Inject, Input, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModalRef, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-identifiers",
    providers: [NgbActiveModal],
    templateUrl: "./identifiers.component.html"
})
export class IdentifiersComponent {

    @ViewChild("newIdentifierContent") public newIdentifierContent: NgbModalModule;
    @Input() public elt: any;
    @Output() onEltChange = new EventEmitter();
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
            this.onEltChange.emit();
            this.modalRef.close();
        }
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier removed. Save to confirm.");
        } else {
            this.onEltChange.emit();
            this.modalRef.close();
        }
    }
}
