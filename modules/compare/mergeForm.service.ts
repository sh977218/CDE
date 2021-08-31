import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MergeDeService } from 'compare/mergeDe.service';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import {
    mergeArrayByDefinitions, mergeArrayByDesignations, mergeArrayByIds, mergeArrayByProperties, mergeArrayByReferenceDocuments
} from 'core/adminItem/classification';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { transferClassifications } from 'shared/classification/classificationShared';
import { CdeForm } from 'shared/form/form.model';
import { CbErr1 } from 'shared/models.model';

@Injectable()
export class MergeFormService {
    error: any = {};
    maxNumberQuestions!: number;
    numMergedQuestions!: number;

    constructor(private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                private mergeDeService: MergeDeService) {
    }

    saveForm(form: CdeForm, cb: CbErr1<CdeForm | void>) {
        this.http.post<CdeForm>('/server/form/publishExternal', form).subscribe(
            data => {
                cb(undefined, data);
            },
            err => {
                cb('Error, unable to save form ' + form.tinyId + ' ' + err);
            }
        );
    }

    private async mergeQuestions(questionsFrom: any, questionsTo: any, fields: FormMergeFields) {
        this.numMergedQuestions = 0;
        this.maxNumberQuestions = questionsFrom.length;
        for (let i = 0; i < questionsFrom.length; i++) {
            const questionFrom = questionsFrom[i];
            const questionTo = questionsTo[i];
            const tinyIdFrom = questionFrom.question.cde.tinyId;
            const tinyIdTo = questionTo.question.cde.tinyId;
            await this.mergeDeService.doMerge(tinyIdFrom, tinyIdTo, fields.cde);
            questionFrom.isRetired = true;
            this.numMergedQuestions++;
        }

    }

    async doMerge(mergeFrom: any, mergeTo: any, fields: FormMergeFields) {
        if (mergeFrom.questions.length !== mergeTo.questions.length) {
            throw new Error('number of question on left is not same on right.');
        } else {
            if (fields.designations) {
                mergeArrayByDesignations(mergeFrom, mergeTo);
            }
            if (fields.definitions) {
                mergeArrayByDefinitions(mergeFrom, mergeTo);
            }
            if (fields.referenceDocuments) {
                mergeArrayByReferenceDocuments(mergeFrom, mergeTo);
            }
            if (fields.properties) {
                mergeArrayByProperties(mergeFrom, mergeTo);
            }
            if (fields.ids) {
                mergeArrayByIds(mergeFrom, mergeTo);
            }
            if (fields.classifications) {
                transferClassifications(mergeFrom, mergeTo);
            }
            if (fields.questions) {
                await this.mergeQuestions(mergeFrom.questions, mergeTo.questions, fields);
            }
        }
    }

    validateQuestions(left: any, right: any, fields: FormMergeFields) {
        this.error.error = '';
        this.error.ownSourceForm = this.isAllowedModel.isAllowed(left);
        this.error.ownTargetForm = this.isAllowedModel.isAllowed(right);
        if (fields.questions && left.questions.length > right.questions.length) {
            this.error.error = 'Form merge from has too many questions';
            return this.error;
        }
        left.questions.forEach((leftQuestion: any, i: number) => {
            const leftTinyId = leftQuestion.question.cde.tinyId;
            leftQuestion.info = {};
            const info = leftQuestion.info;
            right.questions.filter((rightQuestion: any, j: number) => {
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
