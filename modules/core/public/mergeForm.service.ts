import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MergeCdeService } from "./mergeCde.service";
import { MergeShareService } from "./mergeShare.service";
import * as async from "async";

@Injectable()
export class MergeFormService {
    constructor(private http: Http, private mergeCdeService: MergeCdeService, private mergeShareService: MergeShareService) {
    }
    public saveForm(form, cb) {
        //noinspection TypeScriptValidateTypes
        this.http.post("/form", form).subscribe(
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
                this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, fields, (err) => {
                    if (err) return cb(err);
                    else {
                        index++;
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
            this.mergeShareService.mergeArray(mergeFrom.naming, mergeTo.naming);
        }
        if (fields.referenceDocuments) {
            this.mergeShareService.mergeArray(mergeFrom.referenceDocuments, mergeTo.referenceDocuments);
        }
        if (fields.properties) {
            this.mergeShareService.mergeArray(mergeFrom.properties, mergeTo.properties);
        }
        if (fields.ids) {
            this.mergeShareService.mergeArray(mergeFrom.ids, mergeTo.ids);
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
