import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
// import * as moment from 'moment/min/moment.min';

import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CodeAndSystem } from 'shared/models.model';
import { FormQuestion } from 'shared/form/form.model';
import { SkipLogicService } from 'nativeRender/skipLogic.service';

@Component({
    selector: 'cde-native-question',
    templateUrl: './nativeQuestion.component.html',
})
export class NativeQuestionComponent implements OnInit {
    @Input() formElement: FormQuestion;
    @Input() numSubQuestions: number;
    @Input() parentValue: string;
    NRS = NativeRenderService;
    datePrecisionToType = FormQuestion.datePrecisionToType;
    datePrecisionToStep = FormQuestion.datePrecisionToStep;
    metadataTagsNew: string;
    previousUom: CodeAndSystem;

    // static readonly reHasTime = /[hHmsSkaAZ]/;

    ngOnInit() {
        this.previousUom = this.formElement.question.answerUom;
    }

    constructor(public sls: SkipLogicService,
                public nrs: NativeRenderService) {
    }

    classColumns(pvIndex, index) {
        let result = "";

        if (pvIndex !== -1 && this.nrs.profile && this.nrs.profile.numberOfColumns) {
            switch (this.nrs.profile.numberOfColumns) {
                case 2:
                    result = 'col-sm-6';
                    break;
                case 3:
                    result = 'col-sm-4';
                    break;
                case 4:
                    result = 'col-sm-3';
                    break;
                case 5:
                    result = 'col-sm-2-4';
                    break;
                case 6:
                    result = 'col-sm-2';
                    break;
                default:
            }
        }

        if (this.isFirstInRow(pvIndex !== undefined ? pvIndex : index)) result += ' clear';
        return result;
    }

    convert() {
        if (this.previousUom && this.formElement.question.answer != null) {
            let value: number;
            if (typeof(this.formElement.question.answer) === 'string') value = parseFloat(this.formElement.question.answer);
            else value = this.formElement.question.answer;

            if (typeof(value) === 'number' && !isNaN(value)) {
                let unit = this.formElement.question.answerUom;
                this.nrs.convertUnits(value, this.previousUom, this.formElement.question.answerUom, (error, result) => {
                    if (!error && result !== undefined && !isNaN(result) && unit === this.formElement.question.answerUom) {
                        this.formElement.question.answer = result;
                    }
                });
            }
        }
        this.previousUom = this.formElement.question.answerUom;
    }


    hasHeading(q: FormQuestion): boolean {
        return this.hasLabel(q) || q.instructions && !!q.instructions.value;
    }

    hasLabel(q: FormQuestion): boolean {
        return q.label && !q.hideLabel;
    }

    isFirstInRow(index: number): boolean {
        if (this.nrs.profile && this.nrs.profile.numberOfColumns > 0) return index % this.nrs.profile.numberOfColumns === 0;
        else return index % 4 === 0;
    }

    isOneLiner(q: FormQuestion, numSubQuestions: number): boolean {
        return numSubQuestions && !this.hasHeading(q) && (!q.instructions || !q.instructions.value)
            && q.elementType === 'question' && q.question.datatype !== 'Value List';
    }

    // updateDateTime() {
    //     let d = this.formElement.question.answerDate;
    //     let t = this.formElement.question.answerTime;
    //     if (!d) return this.formElement.question.answer = '';
    //     if (!t) t = {hour: 0, minute: 0, second: 0};
    //
    //     let m = moment([d.year, d.month - 1, d.day, t.hour, t.minute, t.second]);
    //     if (m.isValid()) {
    //         if (this.formElement.question.datatypeDate && this.formElement.question.datatypeDate.format) {
    //             this.formElement.question.answer = m.format(this.formElement.question.datatypeDate.format);
    //         }
    //         else this.formElement.question.answer = m.format('YYYY-MM-DDTHH:mm:ssZ');
    //     } else {
    //         this.formElement.question.answer = '';
    //     }
    // }
}
