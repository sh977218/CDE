import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-admin-item-properties",
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent {

    @ViewChild("newPropertyModal") public newPropertyModal: NgbModalModule;
    @Input() public elt: any;

    newProperty: any;

    constructor(@Inject("Alert") private alert,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    showDelete(modal) {
        modal.showDelete = true;
    }

    hideDelete(modal) {
        delete modal.showDelete;
    }

    addId() {
        this.elt.properties.push(this.newProperty);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property added. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Added");
            });
        }
        this.childModal.hide();
    }

    removeId(index) {
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
