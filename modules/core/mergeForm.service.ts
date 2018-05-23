import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import async_forEachSeries from 'async/forEachSeries';

import { IsAllowedService } from 'core/isAllowed.service';
import { MergeCdeService } from 'core/mergeCde.service';
import { MergeShareService } from 'core/mergeShare.service';


@Injectable()
export class MergeFormService {
    error: any = {
        error: '',
        ownTargetForm: false,
        ownSourceForm: false
    };

    constructor(
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        private mergeCdeService: MergeCdeService,
        private mergeShareService: MergeShareService,
    ) {
    }

    saveForm(form, cb) {
        //noinspection TypeScriptValidateTypes
        this.http.put('/form/' + form.tinyId, form).subscribe(
            data => {
                cb(null, data);
            },
            err => {
                cb('Error, unable to save form ' + form.tinyId + ' ' + err);
            }
        );
    }

    private mergeQuestions(questionsFrom, questionsTo, fields, doneOne, cb) {
        let index = 0;
        //noinspection TypeScriptUnresolvedFunction
        async_forEachSeries(questionsFrom, (questionFrom: any, doneOneQuestion) => {
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
                        if (result && result[0].registrationState.registrationStatus === 'Retired') {
                            questionFrom.isRetired = true;
                        }
                        doneOne(index, doneOneQuestion);
                    }
                });
            }
        }, (err) => {
            cb(err);
        });
    }

    doMerge(mergeFrom, mergeTo, fields, doneOne, cb) {
        if (mergeFrom.length !== mergeTo.length) {
            cb({error: 'number of question on left is not same on right.'});
        } else {
            if (fields.designations) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, 'designations');
            }
            if (fields.definitions) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, 'definitions');
            }
            if (fields.referenceDocuments) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, 'referenceDocuments');
            }
            if (fields.properties) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, 'properties');
            }
            if (fields.ids) {
                this.mergeShareService.mergeArrayByProperty(mergeFrom, mergeTo, 'ids');
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
        this.error.error = '';
        this.error.ownSourceForm = this.isAllowedModel.isAllowed(left);
        this.error.ownTargetForm = this.isAllowedModel.isAllowed(right);
        if (selectedFields.questions && left.questions.length > right.questions.length) {
            this.error.error = 'Form merge from has too many questions';
            return this.error;
        }
        left.questions.forEach((leftQuestion, i) => {
            let leftTinyId = leftQuestion.question.cde.tinyId;
            leftQuestion.info = {};
            right.questions.filter((rightQuestion, j) => {
                let rightTinyId = rightQuestion.question.cde.tinyId;
                if (leftTinyId === rightTinyId && i !== j) {
                    leftQuestion.info.error = 'Not align';
                    this.error.error = 'Form not align';
                } else if (leftTinyId === rightTinyId && i === j) {
                    leftQuestion.info.match = true;
                }
            });
        });
    }
}
