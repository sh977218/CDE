import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-admin-item-properties",
    providers: [NgbActiveModal],
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent {

    @ViewChild("newPropertyContent") public newPropertyContent: NgbModalModule;
    @Input() public elt: any;

    public newProperty: any = {};

    constructor(@Inject("Alert") private alert,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openNewPropertyModal() {
        const modalRef = this.modalService.open(this.newPropertyContent, {size: "lg"});
    }

    addNewProperty() {
        this.elt.properties.push(this.newProperty);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property added. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Added");
            });
        }
    }

    removeProperty(index) {
        this.elt.properties.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property removed. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Removed");
            });
        }
    }

}
