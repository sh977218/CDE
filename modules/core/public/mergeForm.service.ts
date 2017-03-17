import { Injectable, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { MergeCdeService } from "./mergeCde.service";
import { MergeShareService } from "./mergeShare.service";
import * as async from "async";

@Injectable()
export class MergeFormService {
    constructor(private http: Http,
                private mergeCdeService: MergeCdeService,
                private mergeShareService: MergeShareService) {
    }

    public saveForm(form, cb) {
        //noinspection TypeScriptValidateTypes
        this.http.post("/form", form).map(res => res.json()).subscribe(
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
                        if (result === "retired") questionFrom.isRetired = true;
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
            return {error: "number of question on left is not same on right."};
        }
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
