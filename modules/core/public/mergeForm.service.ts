import { Injectable, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { MergeCdeService } from "./mergeCde.service";
import { MergeShareService } from "./mergeShare.service";
import * as async from "async";

@Injectable()
export class MergeFormService {

    public error: any = {
        error: "",
        ownTargetForm: false,
        ownSourceForm: false
    };

    constructor(private http: Http,
                private mergeCdeService: MergeCdeService,
                private mergeShareService: MergeShareService,
                @Inject("isAllowedModel") private isAllowedModel) {
    }

    public saveForm(form, cb) {
        //noinspection TypeScriptValidateTypes
        this.http.put("/form/" + form.tinyId, form).map(res => res.json()).subscribe(
            data => {
                cb(null, data);
            },
            err => {
                cb("Error, unable to save form " + form.tinyId + " " + err);
            }
        );
    }

    private mergeQuestions(questionsFrom, questionsTo, fields, doneOne, cb) {
        let index = 0;
        //noinspection TypeScriptUnresolvedFunction
        async.forEachSeries(questionsFrom, (questionFrom, doneOneQuestion) => {
            let questionTo = questionsTo[index];
            if (!questionFrom.question.cde.tinyId || !questionTo.question.cde.tinyId) {
                index++;
                doneOne(index, doneOneQuestion);
            } else {
                let tinyIdFrom = questionFrom.question.cde.tinyId;
                let tinyIdTo = questionTo.question.cde.tinyId;
                this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, fields, (err, result) => {
                    if (err) return cb(err);
                    else {
                        index++;
                        if (result[0].registrationState.registrationStatus === "Retired")
                            questionFrom.isRetired = true;
                        doneOne(index, doneOneQuestion);
                    }
                });
            }
        }, (err) => {
            cb(err);
        });
    }

    public doMerge(mergeFrom, mergeTo, fields, doneOne, cb) {
        if (mergeFrom.length !== mergeTo.length) {
            cb({error: "number of question on left is not same on right."});
        } else {
            if (fields.naming) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, "naming");
            }
            if (fields.referenceDocuments) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, "referenceDocuments");
            }
            if (fields.properties) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, "properties");
            }
            if (fields.ids) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, "ids");
            }
            if (fields.classifications) {
                this.mergeShareService.mergeClassifications(mergeFrom, mergeTo);
            }
            if (fields.questions) {
                this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields.cde, (index, next) => {
                    doneOne(index, next);
                }, (err) => {
                    cb(err);
                });
            }
        }
    }

    validateQuestions(left, right, selectedFields) {
        this.error.error = "";
        this.error.ownSourceForm = this.isAllowedModel.isAllowed(left);
        this.error.ownTargetForm = this.isAllowedModel.isAllowed(right);
        if (selectedFields.questions && left.questions.length > right.questions.length) {
            this.error.error = "Form merge from has too many questions";
            return this.error;
        }
        left.questions.forEach((leftQuestion, i) => {
            let leftTinyId = leftQuestion.question.cde.tinyId;
            leftQuestion.info = {};
            right.questions.filter((rightQuestion, j) => {
                let rightTinyId = rightQuestion.question.cde.tinyId;
                if (leftTinyId === rightTinyId && i !== j) {
                    leftQuestion.info.error = "Not align";
                    this.error.error = "Form not align";
                } else if (leftTinyId === rightTinyId && i === j) {
                    leftQuestion.info.match = true;
                }
            });
        });
    }
}
