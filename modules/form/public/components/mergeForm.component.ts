import { Component, Inject, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { ModalDirective } from "ng2-bootstrap/modal";
import "rxjs/add/operator/map";

let async = require("async");

@Component({
    selector: "merge-form",
    templateUrl: "./mergeForm.component.html"
})
export class MergeFormComponent {
    @ViewChild("MergeFormModal") public mergeFormModal:ModalDirective;
    @Input() public left:any;
    @Input() public right:any;
    public mergeFields:any;

    constructor(private http:Http, @Inject("Alert") private alert) {
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
        this.mergeFields.questions = true;
    }

    deselectAllMergerFields() {
        this.mergeFields.naming = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.properties = false;
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

    public changeSort(reordering, insert, remove) {
        console.log("a");
    }

    public doMerge() {
        if (this.mergeFields.questions && this.left.questions.length !== this.right.questions.length) {
            return this.alert.addAlert("danger", "number of question on left is not same on right.");
        }
        if (this.mergeFields.naming) {
            this.right.naming = this.right.naming.concat(this.left.naming);
        }
        if (this.mergeFields.referenceDocuments) {
            this.right.referenceDocuments = this.right.referenceDocuments.concat(this.left.referenceDocuments);
        }
        if (this.mergeFields.properties) {
            this.right.properties = this.right.properties.concat(this.left.properties);
        }
        if (this.mergeFields.ids) {
            this.right.ids = this.right.ids.concat(this.left.ids);
        }
        if (this.mergeFields.questions) {
            let index = 0;
            async.forEachSeries(this.left.questions, (q, doneQ)=> {
                if (!q.question.cde.tinyId || !this.right.questions[index].question.cde.tinyId) {
                    index++;
                    doneQ();
                } else {
                    let leftTinyId = q.question.cde.tinyId;
                    let rightTinyId = this.right.questions[index].question.cde.tinyId;
                    this.http.get("debytinyid/" + leftTinyId).map((res) => res.json()).subscribe(
                        (leftData)=> {
                            let leftCde = leftData;
                            this.http.get("/debytinyid/" + rightTinyId).map((res) => res.json()).subscribe(
                                (rightData)=> {
                                    let rightCde = rightData;
                                    if (this.mergeFields.cde.naming) {
                                        rightCde.naming = rightCde.naming.concat(leftCde.naming);
                                    }
                                    if (this.mergeFields.cde.referenceDocuments) {
                                        rightCde.referenceDocuments = rightCde.referenceDocuments.concat(leftCde.referenceDocuments);
                                    }
                                    if (this.mergeFields.cde.properties) {
                                        rightCde.properties = rightCde.properties.concat(leftCde.properties);
                                    }
                                    this.http.post("/retireCde", {cde: leftCde, merge: rightCde}).subscribe((data)=> {

                                    }, (err)=> {
                                    })
                                }, (err)=> {
                                    this.alert.addAlert("danger", "Error, unable to get " + rightTinyId);
                                });
                        },
                        (err) => {
                            this.alert.addAlert("danger", "Error, unable to get " + leftTinyId)
                        }
                    );
                }
            }, ()=> {
                this.http.post("/form", this.right).subscribe(
                    (data) =>
                        this.alert.addAlert("success", "form merged."),
                    (err) =>
                        this.alert.addAlert("danger", "Error, unable to save")
                );
            })
        }
    }
}