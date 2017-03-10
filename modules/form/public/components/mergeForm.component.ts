import { Component, Inject, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { ModalDirective } from "ng2-bootstrap/modal";
import { MergeFormService } from "../../../core/public/mergeForm.service"
import "rxjs/add/operator/map";

@Component({
    selector: "merge-form",
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent {
    @ViewChild("MergeFormModal") public mergeFormModal:ModalDirective;
    @Input() public left:any;
    @Input() public right:any;
    public mergeFields:any;
    public questionsMerged:any;
    public allQuestions:any;
    public showProgressBar:any;

    constructor(private http:Http, @Inject("Alert") private alert, private mergeFormService:MergeFormService) {
        this.showProgressBar = false;
        this.mergeFields = {
            naming: false,
            referenceDocuments: false,
            properties: false,
            ids: false,
            questions: false,
            cde: {
                naming: false,
                referenceDocuments: false,
                properties: false
            }
        };
    }

    openMergeForm() {
        this.mergeFormModal.toggle();
    }

    selectAllMergerFields() {
        this.mergeFields.naming = true;
        this.mergeFields.referenceDocuments = true;
        this.mergeFields.properties = true;
        this.mergeFields.ids = true;
        this.mergeFields.questions = true;
    }

    deselectAllMergerFields() {
        this.mergeFields.naming = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.properties = false;
        this.mergeFields.ids = false;
        this.mergeFields.questions = false;
    }

    public addItem(questions, sortableComponent) {
        questions.push({question: {cde: ""}});
        if (sortableComponent)
            sortableComponent.writeValue(questions);
    }

    public removeItem(questions, sortableComponent) {
        questions.splice(-1, 1);
        if (sortableComponent)
            sortableComponent.writeValue(questions);
    }

    public doMerge() {
        let result = this.mergeFormService.doMerge(this.left, this.right);
        this.showProgressBar = false;
        this.showProgressBar = true;
        this.allQuestions = mergeFrom.questions.length;
    }
}