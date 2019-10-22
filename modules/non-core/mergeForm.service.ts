import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import async_forEachSeries from 'async/forEachSeries';
import { CompareForm, CompareQuestion } from 'compare/compareSideBySide/compareSideBySide.component';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MergeCdeService } from 'non-core/mergeCde.service';
import { CdeForm } from 'shared/form/form.model';
import { Cb, Cb2, CbErr } from 'shared/models.model';
import { transferClassifications } from 'shared/system/classificationShared';

export interface MergeFieldsForm {
    designations: boolean;
    definitions: boolean;
    referenceDocuments: boolean;
    properties: boolean;
    ids: boolean;
    classifications: boolean;
    questions: boolean;
    cde: MergeFieldsFormCde;
}

export interface MergeFieldsFormCde {
    designations: boolean;
    definitions: boolean;
    referenceDocuments: boolean;
    properties: boolean;
    attachments: boolean;
    dataSets: boolean;
    derivationRules: boolean;
    sources: boolean;
    ids: boolean;
    classifications: boolean;
    retireCde: boolean;
}

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

    saveForm(form: CdeForm, cb: CbErr<CdeForm>) {
        this.http.post<CdeForm>('/formPublishExternal', form).subscribe(
            data => {
                cb(undefined, data);
            },
            err => {
                cb('Error, unable to save form ' + form.tinyId + ' ' + err);
            }
        );
    }

    private mergeQuestions(questionsFrom: CompareQuestion[],
                           questionsTo: CompareQuestion[],
                           fields: MergeFieldsFormCde,
                           doneOne: Cb2<number, Cb>,
                           cb: CbErr) {
        let index = 0;
        async_forEachSeries(questionsFrom, (questionFrom: CompareQuestion, doneOneQuestion: Cb) => {
            const questionTo = questionsTo[index];
            if (!questionFrom.question.cde.tinyId || !questionTo.question.cde.tinyId) {
                index++;
                doneOne(index, doneOneQuestion);
            } else {
                const tinyIdFrom = questionFrom.question.cde.tinyId;
                const tinyIdTo = questionTo.question.cde.tinyId;
                this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, fields, (err, result) => {
                    if (err) {
                        return cb(err);
                    } else {
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

    doMerge(mergeFrom: CompareForm, mergeTo: CompareForm, fields: MergeFieldsForm, doneOne: Cb2<number, Cb>, cb: CbErr) {
        if (mergeFrom.questions.length !== mergeTo.questions.length) {
            cb('number of question on left is not same on right.');
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
                this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields.cde, doneOne, cb);
            }
        }
    }

    validateQuestions(left: CompareForm, right: CompareForm, selectedFields: MergeFieldsForm) {
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
            const info = leftQuestion.info;
            right.questions.filter((rightQuestion, j) => {
                const rightTinyId = rightQuestion.question.cde.tinyId;
                if (leftTinyId === rightTinyId && i !== j) {
                    info.error = 'Not align';
                    this.error.error = 'Form not align';
                } else if (leftTinyId === rightTinyId && i === j) {
                    info.match = true;
                }
            });
        });
    }
}
