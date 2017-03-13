import { Component, Inject, Input, ViewChild } from "@angular/core";
import { MergeFormService } from "../../../core/public/mergeForm.service";
import "rxjs/add/operator/map";
import { ModalDirective, SortableComponent } from "ng2-bootstrap/index";

@Component({
    selector: "cde-merge-form",
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent {
    @ViewChild("MergeFormModal") public mergeFormModal: ModalDirective;
    @ViewChild("LeftSortableComponent") leftSortableComponent: SortableComponent;
    @Input() public left: any;
    @Input() public right: any;
    public mergeFields: any;
    public questionsMerged: any;
    public allQuestions: any;
    public showProgressBar: any;
    public doneMerge: any = false;
    public error: any;

    constructor(@Inject("Alert") private alert, private mergeFormService: MergeFormService) {
        this.showProgressBar = false;
        this.mergeFields = {
            naming: false,
            referenceDocuments: false,
            properties: false,
            ids: false,
            classifications: false,
            questions: false,
            cde: {
                naming: false,
                referenceDocuments: false,
                properties: false,
                ids: false,
                classifications: false,
                retireCde: false
            }
        };
    }

    ngOnInit() {
        if (this.left.questions.length > this.right.questions.length) {
            this.error = "Left form has too many questions";
        } else {
            this.error = false;
        }
    }

    openMergeForm() {
        this.mergeFormModal.toggle();
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
        this.mergeFields.cde.classifications = true;
    }

    deselectAllFormMergerFields() {
        this.mergeFields.naming = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.properties = false;
        this.mergeFields.ids = false;
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

    addItem(questions) {
        questions.push({question: {cde: ""}});
        this.leftSortableComponent.writeValue(questions);
        if (this.left.questions.length > this.right.questions.length) {
            this.error = "Left form has too many questions";
        } else {
            this.error = false;
        }
    }

    removeItem(questions, index) {
        if (index === undefined) index = -1;
        questions.splice(index, 1);
        this.leftSortableComponent.writeValue(questions);
        if (this.left.questions.length > this.right.questions.length) {
            this.error = "Left form has too many questions";
        } else {
            this.error = false;
        }
    }

    public doMerge() {
        this.showProgressBar = true;
        this.allQuestions = this.left.questions.length;
        this.mergeFormService.doMerge(this.left, this.right, this.mergeFields, (index, next) => {
            this.questionsMerged = index;
            next();
        }, (err) => {
            if (err) {
                this.alert.addAlert("danger", err);
                return;
            }
            else {
                this.mergeFormService.saveForm(this.right, (err) => {
                    if (err)
                        this.alert.addAlert("danger", err);
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
    }
}