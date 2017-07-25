import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { MergeFormService } from "../../../../core/public/mergeForm.service";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-merge-form",
    providers: [NgbActiveModal],
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent {
    @ViewChild("mergeFormContent") public mergeFormContent: NgbModalModule;
    @Input() public left: any;
    @Input() public right: any;
    public modalRef: NgbModalRef;
    public mergeFields: any = {
        naming: true,
        referenceDocuments: true,
        properties: true,
        ids: true,
        classifications: true,
        questions: true,
        cde: {
            naming: true,
            referenceDocuments: true,
            properties: true,
            attachments: true,
            dataSets: true,
            derivationRules: true,
            sources: true,
            ids: true,
            classifications: true,
            retireCde: false
        }
    };
    public numMergedQuestions: any;
    public maxNumberQuestions: any;
    public showProgressBar: boolean = false;
    public doneMerge: boolean = false;

    constructor(private alert: AlertService,
                public mergeFormService: MergeFormService,
                @Inject("isAllowedModel") private isAllowedModel,
                public modalService: NgbModal) {
    }

    selectAllFormMergerFields() {
        this.mergeFields.naming = true;
        this.mergeFields.referenceDocuments = true;
        this.mergeFields.properties = true;
        this.mergeFields.ids = true;
        this.mergeFields.classifications = true;
        this.mergeFields.questions = true;
    }

    selectAllCdeMergerFields() {
        this.mergeFields.cde.naming = true;
        this.mergeFields.cde.referenceDocuments = true;
        this.mergeFields.cde.properties = true;
        this.mergeFields.cde.ids = true;
        this.mergeFields.cde.attachments = true;
        this.mergeFields.cde.dataSets = true;
        this.mergeFields.cde.derivationRules = true;
        this.mergeFields.cde.sources = true;
        this.mergeFields.cde.classifications = true;
    }

    deselectAllFormMergerFields() {
        this.mergeFields.naming = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.properties = false;
        this.mergeFields.ids = false;
        this.mergeFields.cde.attachments = false;
        this.mergeFields.cde.dataSets = false;
        this.mergeFields.cde.derivationRules = false;
        this.mergeFields.cde.sources = false;
        this.mergeFields.classifications = false;
        this.mergeFields.questions = false;
    }

    deselectAllCdeMergerFields() {
        this.mergeFields.cde.naming = false;
        this.mergeFields.cde.referenceDocuments = false;
        this.mergeFields.cde.properties = false;
        this.mergeFields.cde.ids = false;
        this.mergeFields.cde.classifications = false;
    }

    openMergeFormModal() {
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
        this.modalRef = this.modalService.open(this.mergeFormContent, {size: "lg"});
    }

    public doMerge() {
        this.showProgressBar = true;
        this.maxNumberQuestions = this.right.questions.length;
        this.mergeFormService.doMerge(this.left, this.right, this.mergeFields, (index, next) => {
            this.numMergedQuestions = index;
            next();
        }, (err) => {
            if (err)
                return this.alert.addAlert("danger", err);
            else {
                if (this.mergeFormService.error.ownSourceForm) {
                    this.left.changeNote = "Merge to tinyId " + this.right.tinyId;
                    if (this.isAllowedModel.isAllowed(this.left))
                        this.left.registrationState.registrationStatus = "Retired";
                    this.mergeFormService.saveForm(this.left, (err) => {
                        if (err) this.alert.addAlert("danger", "Can not save source form.");
                        else {
                            this.right.changeNote = "Merge from tinyId " + this.left.tinyId;
                            this.mergeFormService.saveForm(this.right, (err) => {
                                if (err) this.alert.addAlert("danger", "Can not save target form.");
                                else {
                                    this.doneMerge = true;
                                    this.alert.addAlert("success", "Form merged");
                                    setTimeout(() => {
                                        this.showProgressBar = false;
                                        return;
                                    }, 3000);
                                }
                            });
                        }
                    });
                } else {
                    this.right.changeNote = "Merge from tinyId " + this.left.tinyId;
                    this.mergeFormService.saveForm(this.right, (err) => {
                        if (err) this.alert.addAlert("danger", "Can not save target form.");
                        else {
                            this.doneMerge = true;
                            this.alert.addAlert("success", "Form merged");
                            setTimeout(() => {
                                this.showProgressBar = false;
                                return;
                            }, 3000);
                        }
                    });
                }
            }
        });
    }
}