import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompareForm, CompareQuestion } from 'compare/compareSideBySide/compareSideBySide.component';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MergeDeService } from 'compare/mergeDe.service';
import { CdeForm } from 'shared/form/form.model';
import { CbErr } from 'shared/models.model';
import { transferClassifications } from 'shared/system/classificationShared';
import { FormMergeFields } from './mergeForm/formMergeFields.model';


@Injectable()
export class MergeFormService {
    error: any = {};

    constructor(private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                private mergeDeService: MergeDeService) {
    }

    saveForm(form: CdeForm, cb: CbErr<CdeForm>) {
        this.http.post<CdeForm>('/server/form/publishExternal', form).subscribe(
            data => {
                cb(undefined, data);
            },
            err => {
                cb('Error, unable to save form ' + form.tinyId + ' ' + err);
            }
        );
    }

    private async mergeQuestions(questionsFrom: CompareQuestion[], questionsTo: CompareQuestion[], fields: FormMergeFields) {
        for (const questionFrom of questionsFrom) {
            const questionToFilter = questionsTo.filter(q => q.question.cde.tinyId === questionFrom.question.cde.tinyId);
            if (questionToFilter.length !== 1) {
                throw new Error(`${questionFrom.question.cde.tinyId} does not exist.`);
            } else {
                const questionTo = questionToFilter[0];
                const tinyIdFrom = questionFrom.question.cde.tinyId;
                const tinyIdTo = questionTo.question.cde.tinyId;
                await this.mergeDeService.doMerge(tinyIdFrom, tinyIdTo, fields.cde);
            }
        }

    }

    async doMerge(mergeFrom: CompareForm, mergeTo: CompareForm, fields: FormMergeFields) {
        if (mergeFrom.questions.length !== mergeTo.questions.length) {
            throw new Error('number of question on left is not same on right.');
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
                await this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields);
            }
        }
    }

    validateQuestions(left: CompareForm, right: CompareForm, fields: FormMergeFields) {
        this.error.error = '';
        this.error.ownSourceForm = this.isAllowedModel.isAllowed(left);
        this.error.ownTargetForm = this.isAllowedModel.isAllowed(right);
        if (fields.questions && left.questions.length > right.questions.length) {
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
