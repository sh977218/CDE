import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import async_forEachSeries from 'async/forEachSeries';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MergeCdeService } from 'non-core/mergeCde.service';
import { transferClassifications } from 'shared/system/classificationShared';


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
    ) {
    }

    saveForm(form, cb) {
        //noinspection TypeScriptValidateTypes
        this.http.post('/formPublishExternal', form).subscribe(
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
            const questionTo = questionsTo[index];
            if (!questionFrom.question.cde.tinyId || !questionTo.question.cde.tinyId) {
                index++;
                doneOne(index, doneOneQuestion);
            } else {
                const tinyIdFrom = questionFrom.question.cde.tinyId;
                const tinyIdTo = questionTo.question.cde.tinyId;
                this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, fields, (err, result) => {
                    if (err) { return cb(err); }
                    else {
                        index++;
                        if (result && result[0].registrationState.registrationStatus === 'Retired') {
                            questionFrom.isRetired = true;
                        }
                        doneOne(index, doneOneQuestion);
                    }
                });
            }
        }, cb);
    }

    doMerge(mergeFrom, mergeTo, fields, doneOne, cb) {
        if (mergeFrom.length !== mergeTo.length) {
            cb({error: 'number of question on left is not same on right.'});
        } else {
            if (fields.designations) {
                mergeArrayByProperty(mergeFrom, mergeTo, 'designations');
            }
            if (fields.definitions) {
                mergeArrayByProperty(mergeFrom, mergeTo, 'definitions');
            }
            if (fields.referenceDocuments) {
                mergeArrayByProperty(mergeFrom, mergeTo, 'referenceDocuments');
            }
            if (fields.properties) {
                mergeArrayByProperty(mergeFrom, mergeTo, 'properties');
            }
            if (fields.ids) {
                mergeArrayByProperty(mergeFrom, mergeTo, 'ids');
            }
            if (fields.classifications) {
                transferClassifications(mergeFrom, mergeTo);
            }
            if (fields.questions) {
                this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields.cde, (index, next) => {
                    doneOne(index, next);
                }, cb);
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
            const leftTinyId = leftQuestion.question.cde.tinyId;
            leftQuestion.info = {};
            right.questions.filter((rightQuestion, j) => {
                const rightTinyId = rightQuestion.question.cde.tinyId;
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
