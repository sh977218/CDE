import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { ModalDirective, SortableComponent } from "ng2-bootstrap/index";
import "rxjs/add/operator/map";
import { MergeFormService } from "../../../core/public/mergeForm.service";
import { MergeCdeService } from "../../../core/public/mergeCde.service";

@Component({
    selector: "cde-merge-form",
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent implements OnInit {
    @ViewChild("MergeFormModal")
    public mergeFormModal: ModalDirective;
    @ViewChild("LeftSortableComponent")
    leftSortableComponent: SortableComponent;
    @Input()
    public left: any;
    @Input()
    public right: any;
    public mergeFields: any;
    public numMergedQuestions: any;
    public maxNumberQuestions: any;
    public showProgressBar: any;
    public doneMerge: any = false;
    public ownTargetForm: any;
    public ownSourceForm: any;
    public info: any = {};

    constructor(@Inject("Alert") private alert,
                private mergeFormService: MergeFormService,
                private mergeCdeService: MergeCdeService,
                @Inject("userResource") private userService,
                @Inject("isAllowedModel") private isAllowedModel) {
        this.showProgressBar = false;
        this.mergeFields = {
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

    private checkCdeOwnShip(array) {
        array.forEach((question) => {
            let tinyId = question.question.cde.tinyId;
            question.info = {};
            this.mergeCdeService.getCdeByTinyId(tinyId).subscribe(cde => {
                question.info.error = this.isAllowedModel.isAllowed(cde) ? "" : "not own";
            }, err => {
                this.alert.addAlert("danger", err);
            });
        });
    }

    ngOnInit() {
        this.checkCdeOwnShip(this.left.questions);
        this.checkCdeOwnShip(this.right.questions);
        this.check();
    }

    check() {
        this.info = {};
        if (!this.userService.user._id) {
            return this.info.warning = "Log in to merge";
        }
        if (!this.isAllowedModel.isAllowed(this.right)) {
            this.ownSourceForm = false;
            this.ownTargetForm = false;
            return this.info.warning = "You do not own target form";
        }
        this.ownTargetForm = true;
        if (!this.isAllowedModel.isAllowed(this.left)) {
            this.ownSourceForm = false;
        }
        if (this.mergeFields.questions && this.left.questions.length > this.right.questions.length) {
            return this.info.warning = "Form merge from has too many questions";
        }
        this.left.questions.forEach((leftQuestion, i) => {
            let leftTinyId = leftQuestion.question.cde.tinyId;
            leftQuestion.info = {};
            this.right.questions.filter((rightQuestion, j) => {
                let rightTinyId = rightQuestion.question.cde.tinyId;
                if (leftTinyId === rightTinyId && i !== j) {
                    leftQuestion.info.error = "not align";
                } else if (leftTinyId === rightTinyId && i === j) {
                    leftQuestion.info.match = true;
                }
            });
        });
    }

    addItem(questions) {
        questions.push({question: {cde: {tinyId: "", name: ""}}});
        this.leftSortableComponent.writeValue(questions);
        this.check();
    }

    removeItem(questions, index) {
        if (index === undefined) index = -1;
        questions.splice(index, 1);
        this.leftSortableComponent.writeValue(questions);
        this.check();
    }

    public doMerge() {
        this.showProgressBar = true;
        this.maxNumberQuestions = this.right.questions.length;
        this.mergeFormService.doMerge(this.left, this.right, this.mergeFields, (index, next) => {
            this.numMergedQuestions = index;
            next();
        }, (err) => {
            if (err) return this.alert.addAlert("danger", err);
            else {
                this.left.changeNote = "Merge to tinyId " + this.right.tinyId;
                if (this.isAllowedModel.isAllowed(this.left))
                    this.left.registrationState.registrationStatus = "Retired";
                if (this.ownSourceForm) {
                    this.mergeFormService.saveForm(this.left, (err) => {
                        if (err) this.alert.addAlert("danger", "Can not save source form.");
                        else {
                            this.right.changeNote = "Merge from tinyId " + this.left.tinyId;
                            this.mergeFormService.saveForm(this.right, (err) => {
                                if (err) this.alert.addAlert("danger", "Can not save target form.");
                                else {
                                    this.doneMerge = true;
                                    this.leftSortableComponent.writeValue(this.left.questions);
                                    this.alert.addAlert("success", "form merged");
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
                            this.leftSortableComponent.writeValue(this.left.questions);
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