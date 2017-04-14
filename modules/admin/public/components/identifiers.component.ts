import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModalRef, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
    
    constructor(@Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) {
    }

    openNewIdentifierModal() {
        this.modalRef = this.modalService.open(this.newIdentifierContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newIdentifier = {};
        }, () => {
        });
    }


    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier added. Save to confirm.");
            this.modalRef.close();
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Identifier Added");
                this.modalRef.close();
            });
        }
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier removed. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Identifier Removed");
            });
        }
    }


}
