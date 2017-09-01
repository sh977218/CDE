import { Component, Inject, Input, Output, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage/dist";

import { ClassifyItemModalComponent } from "../../../adminItem/public/components/classification/classifyItemModal.component";
import * as ClassificationShared from "../../../system/shared/classificationShared.js";
import * as _ from "lodash";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-create-data-element",
    templateUrl: "./createDataElement.component.html"
})
export class CreateDataElementComponent implements OnInit {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @Input() elt;
    modalRef: NgbModalRef;
    @Output() cancel = new EventEmitter();
    @Output() modelChange = new EventEmitter();
    validationMessage;

    constructor(@Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel,
                private localStorageService: LocalStorageService,
                private http: Http,
                private alert: AlertService) {
    }

    ngOnInit(): void {
        if (!this.elt)
            this.elt = {
                elementType: "cde",
                classification: [], stewardOrg: {}, naming: [{
                    designation: "", definition: "", tags: []
                }],
                registrationState: {registrationStatus: "Incomplete"}
            };
        this.validationErrors(this.elt);
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
    }

    afterClassified(event) {
        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };
        let eltCopy = _.cloneDeep(this.elt);
        ClassificationShared.classifyItem(eltCopy, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.elt = eltCopy;
        this.modalRef.close();
    }

    validationErrors(elt) {
        if (!elt.naming[0].designation) {
            this.validationMessage = "Please enter a name for the new CDE";
            return true;
        } else if (!elt.naming[0].definition) {
            this.validationMessage = "Please enter a definition for the new CDE";
            return true;
        } else if (!elt.stewardOrg.name || elt.stewardOrg.name === "Select One") {
            this.validationMessage = "Please select a steward for the new CDE";
            return true;
        }
        if (elt.classification.length === 0) {
            this.validationMessage = "Please select at least one classification";
            return true;
        } else {
            let found = false;
            for (let i = 0; i < elt.classification.length; i++) {
                if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                this.validationMessage = "Please select at least one classification owned by " + elt.stewardOrg.name;
                return true;
            }
        }
        this.validationMessage = null;
        return false;
    };

    confirmDelete(event) {
        let eltCopy = _.cloneDeep(this.elt);
        let steward = ClassificationShared.findSteward(eltCopy, event.deleteOrgName);
        ClassificationShared.removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) this.alert.addAlert("danger", err);
            else {
                for (let i = eltCopy.classification.length - 1; i >= 0; i--) {
                    if (eltCopy.classification[i].elements.length === 0) {
                        eltCopy.classification.splice(i, 1);
                    }
                }
                this.elt = eltCopy;
                this.alert.addAlert("success", "Classification removed.");
            }
        });
    }

    elementNameChanged() {
        if (!(this.elt.naming[0].designation) || this.elt.naming[0].designation.length < 3) return;
        else this.modelChange.emit(this.elt.naming[0].designation);
    };

    updateClassificationLocalStorage(item) {
        let recentlyClassification = <Array<any>>this.localStorageService.get("classificationHistory");
        if (!recentlyClassification) recentlyClassification = [];
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) o.eltId = o.cdeId;
            return _.isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set("classificationHistory", recentlyClassification);
    }
    
    createDataElement() {
        this.http.post("/de", this.elt).map(res => res.json())
            .subscribe(res => window.location.href = "/deView?tinyId=" + res.tinyId,
                err => this.alert.addAlert("danger", err));
    }

    cancelCreateDataElement() {
        this.cancel.emit("cancel");
    }
}
