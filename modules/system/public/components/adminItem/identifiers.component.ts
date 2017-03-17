import {Component, Inject, Input, ViewChild} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-ids",
    templateUrl: "./identifiers.component.html"
})


export class IdentifiersComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;

    newId: any;

    constructor(@Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openNewId() {
        this.childModal.show();
        this.newId = {};
    }

    showDelete(id) {
        id.showDelete = true;
    }

    hideDelete(id) {
        delete id.showDelete;
    }

    addId() {
        this.elt.ids.push(this.newId);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Identifier added. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Identifier Added");
            });
        }
        this.childModal.hide();
    }

    removeId(index) {
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
