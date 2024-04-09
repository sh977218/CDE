import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompareForm } from 'compare/compareSideBySide/compare-form';
import { CompareQuestion } from 'compare/compareSideBySide/compare-question';
import { doMerge as deDoMerge } from 'compare/mergeDe.service';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import {
    mergeArrayByDefinitions,
    mergeArrayByDesignations,
    mergeArrayByIds,
    mergeArrayByProperties,
    mergeArrayByReferenceDocuments,
} from 'core/adminItem/classification';
import { unionWith } from 'lodash';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { transferClassifications } from 'shared/classification/classificationShared';
import { urlComparator } from 'shared/elt/comparator';
import { CdeForm } from 'shared/form/form.model';
import { CbErr1 } from 'shared/models.model';

@Injectable()
export class MergeFormService {
    error: any = {};
    maxNumberQuestions!: number;
    numMergedQuestions!: number;

    constructor(private http: HttpClient, public isAllowedModel: IsAllowedService) {}

    saveForm({ form, cb }: { form: CompareForm; cb: CbErr1<CompareForm | void> }) {
        this.http.post<CompareForm>('/server/form/publishExternal', form).subscribe(
            data => {
                cb(undefined, data);
            },
            err => {
                cb('Error, unable to save form ' + form.tinyId + ' ' + err);
            }
        );
    }

    private async mergeQuestions(
        questionsFrom: CompareQuestion[],
        questionsTo: CompareQuestion[],
        fields: FormMergeFields
    ) {
        this.numMergedQuestions = 0;
        this.maxNumberQuestions = questionsFrom.length;
        for (let i = 0; i < questionsFrom.length; i++) {
            const questionFrom = questionsFrom[i];
            const questionTo = questionsTo[i];
            const tinyIdFrom = questionFrom.question.cde.tinyId;
            const tinyIdTo = questionTo.question.cde.tinyId;
            await deDoMerge(tinyIdFrom, tinyIdTo, fields.cde);
            questionFrom.isRetired = true;
            this.numMergedQuestions++;
        }
    }

    async doMerge(mergeFrom: CompareForm, mergeTo: CompareForm, fields: FormMergeFields) {
        if (mergeFrom.questions.length !== mergeTo.questions.length) {
            throw new Error('number of question on left is not same on right.');
        } else {
            if (fields.copyright) {
                mergeCopyright(mergeFrom, mergeTo);
            }
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

    validateQuestions(left: CompareForm, right: CompareForm, fields: FormMergeFields) {
        this.error.error = '';
        this.error.ownSourceForm = this.isAllowedModel.isAllowed(left);
        this.error.ownTargetForm = this.isAllowedModel.isAllowed(right);
        if (fields.questions && left.questions.length > right.questions.length) {
            this.error.error = 'Left form has too many questions';
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

function mergeCopyright(eltFrom: CdeForm, eltTo: CdeForm) {
    if (!eltFrom.copyright) {
        return;
    }
    if (!eltTo.copyright) {
        eltTo.copyright = eltFrom.copyright;
    }
    if (eltFrom.copyright.authority) {
        eltTo.copyright.authority =
            (eltTo.copyright.authority ? eltTo.copyright.authority + ', ' : '') + eltFrom.copyright.authority;
    }
    if (eltFrom.copyright.text) {
        eltTo.copyright.text = (eltTo.copyright.text ? eltTo.copyright.text + ', ' : '') + eltFrom.copyright.text;
    }
    eltTo.copyright.urls = unionWith(eltTo.copyright.urls, eltFrom.copyright.urls, urlComparator);
    eltTo.isCopyrighted = eltFrom.isCopyrighted || eltTo.isCopyrighted;
}
