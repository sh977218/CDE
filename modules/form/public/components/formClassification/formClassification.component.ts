import { Component, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ClassificationService } from 'core/public/classification.service';
import { UserService } from 'core/public/user.service';

@Component({
    selector: "cde-form-classification",
    templateUrl: "./formClassification.component.html"
})
export class FormClassificationComponent {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChild("classifyCdesComponent") public classifyCdesComponent: ClassifyItemModalComponent;
    @Input() public elt: any;
    public classifyItemModalRef: NgbModalRef;
    public classifyCdesModalRef: NgbModalRef;

    showProgressBar: boolean = false;
    numberProcessed: number;
    numberTotal: number;

    constructor(public http: Http,
                private alert: AlertService,
                private classificationSvc: ClassificationService,
                public userService: UserService,
                public isAllowedModel: IsAllowedService) {
    }


    openClassifyItemModal() {
        this.classifyItemModalRef = this.classifyItemComponent.openModal();
    }

    openClassifyCdesModal() {
        this.classifyCdesModalRef = this.classifyCdesComponent.openModal();
    }

    reloadElt (cb) {
        this.http.get("form/" + this.elt.tinyId).map(res => res.json()).subscribe(res => {
            this.elt = res;
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            if (cb) cb();
        });
    }

    classifyItem(event) {
        this.classificationSvc.classifyItem(this.elt, event.selectedOrg, event.classificationArray,
            "/addFormClassification/", (err) => {
                this.classifyItemModalRef.close();
                if (err) this.alert.addAlert("danger", err._body);
                else this.reloadElt(() => this.alert.addAlert("success", "Classification added."));
            });
    }

    getChildren(formElements, ids) {
        if (formElements)
            formElements.forEach(formElement => {
                if (formElement.elementType === "section" || formElement.elementType === "form") {
                    this.getChildren(formElement.formElements, ids);
                } else if (formElement.elementType === "question") {
                    ids.push({
                        id: formElement.question.cde.tinyId,
                        version: formElement.question.cde.version
                    });
                }
            });
    }

    removeClassif (event) {
        this.classificationSvc.removeClassification(this.elt, event.deleteOrgName,
            event.deleteClassificationArray, "/removeFormClassification/", err => {
                if (err) {
                    this.alert.addAlert("danger", err);
                } else {
                    this.reloadElt(() => this.alert.addAlert("success", "Classification removed."));
                }
            });
    }

    classifyAllCdesInForm(event) {
        let allCdeIds = [];
        this.getChildren(this.elt.formElements, allCdeIds);

        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg,
            elements: allCdeIds
        };

        //noinspection TypeScriptValidateTypes
        this.http.post("/classification/bulk/tinyId", postBody)
            .subscribe(res => {
                if (res["_body"] === "Done") {
                    this.classifyCdesModalRef.close("success");
                    this.alert.addAlert("success", "All CDEs Classified.");
                }
                else if (res["_body"] === "Processing") {
                    let fn = setInterval(() => {
                        //noinspection TypeScriptValidateTypes
                        this.http.get("/bulkClassifyCdeStatus/" + this.elt._id).map(res => res.json())
                            .subscribe(
                                res => {
                                    this.showProgressBar = true;
                                    this.numberProcessed = res.numberProcessed;
                                    this.numberTotal = res.numberTotal;
                                    if (this.numberProcessed >= this.numberTotal) {
                                        this.http.get("/resetBulkClassifyCdesStatus/" + this.elt._id)
                                            .subscribe(() => {
                                                //noinspection TypeScriptUnresolvedFunction
                                                clearInterval(fn);
                                                this.classifyCdesModalRef.close("success");
                                            }, err => {
                                                this.alert.addAlert("danger", err);
                                            });
                                    }
                                },
                                err => {
                                    this.alert.addAlert("danger", err);
                                    this.classifyCdesModalRef.close("error");
                                });
                    }, 5000);
                }
            }, err => {
                this.alert.addAlert("danger", err);
            });
    }


}
