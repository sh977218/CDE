import { Http, Response } from "@angular/http";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";

@Component({
    selector: "merge-form",
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent {

    @ViewChild("mergeFormModal") public mergeFormModal:ModalDirective;
    @Input() public left:any;
    @Input() public right:any;
    @Input() public fields:any;

    constructor(private http: Http) {
        this.fields = {
            naming: false,
            referenceDocuments: true,
            properties: false,
            questions: false
        };
    }

    openMergeForm() {
        this.mergeFormModal.show();
    }

    selectAllMergerFields() {
        this.fields.naming = true;
        this.fields.referenceDocuments = true;
        this.fields.properties = true;
        this.fields.questions = true;
    }
}