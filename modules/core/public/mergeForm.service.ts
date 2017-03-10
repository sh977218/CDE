import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MergeCdeService } from "mergeCde.service";
import { MergeShareService } from "mergeShare.service";
import * as async from "async";

@Injectable()
export class MergeFormService {
    constructor(private http:Http, private mergeCdeService:MergeCdeService, private mergeShareService:MergeShareService) {
    }

    private getCdeByTinyId(tinyId) {
        this.http.get('/debytinyid/' + tinyId).map((res) => res.json());
    }


    private saveForm(form) {
        this.http.post("/form", form).subscribe(
            (data) => {
            },
            (err) => {
                ("danger", "Error, unable to save form " + form.tinyId);
            }
        );
    }

    private mergeQuestions(questionsFrom, questionsTo, fields, cb) {
        let index = 0;
        async.forEachSeries(questionsFrom, (questionFrom, doneOneQuestion) => {
            let questionTo = questionsTo.questions[index];
            if (!questionFrom.question.cde.tinyId || !questionTo.question.cde.tinyId) {
                index++;
                doneOneQuestion();
            } else {
                let tinyIdFrom = questionFrom.question.cde.tinyId;
                let tinyIdTo = questionTo.question.cde.tinyId;
                this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, fields, () => {
                    index++;
                    doneOneQuestion();
                })
            }
        }, ()=> {
            this.saveForm(() => {
                cb();
            });
        });
    }

    public doMerge(mergeFrom, mergeTo, fields, cb) {
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
            this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields.cde, () => {
                return {};
            });
        }
    }
}
