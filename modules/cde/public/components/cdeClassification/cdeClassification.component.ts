import { Component, Input, ViewChild, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../../system/public/components/alert/alert.service";
import { ClassificationService } from "../../../../core/public/classification.service";
import { ClassifyItemModalComponent } from "../../../../adminItem/public/components/classification/classifyItemModal.component";

@Component({
    selector: "cde-cde-classification",
    templateUrl: "./cdeClassification.component.html"
})
export class CdeClassificationComponent {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @Input() public elt: any;
    public classifyItemModalRef: NgbModalRef;

    constructor(public http: Http,
                private alert: AlertService,
                private classificationSvc: ClassificationService,
                @Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openClassifyItemModal() {
        this.classifyItemModalRef = this.classifyItemComponent.openModal();
    }

    reloadElt (cb) {
        this.http.get("de/" + this.elt.tinyId).map(res => res.json()).subscribe(res => {
            this.elt = res;
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            if (cb) cb();
        });
    }

    classifyItem(event) {
        this.classificationSvc.classifyItem(this.elt, event.selectedOrg, event.classificationArray,
            "/addCdeClassification/", (err) => {
                this.classifyItemModalRef.close();
                if (err) {
                    this.alert.addAlert("danger", err._body);
                } else {
                    this.reloadElt(() => this.alert.addAlert("success", "Classification added."));
                }
            });
    }

    removeClassif (event) {
        this.classificationSvc.removeClassification(this.elt, event.deleteOrgName,
            event.deleteClassificationArray, "/removeCdeClassification/", err => {
                if (err) {
                    this.alert.addAlert("danger", err);
                } else {
                    this.reloadElt(() => this.alert.addAlert("success", "Classification removed."));
                }
            });
    }

}