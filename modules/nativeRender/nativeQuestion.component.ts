import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import ucum from 'ucum.js';

import { FormService } from 'nativeRender/form.service';
import { FormQuestion } from 'core/form.model';
import { NativeRenderService } from './nativeRender.service';


@Component({
    selector: 'cde-native-question',
    templateUrl: './nativeQuestion.component.html'
})
export class NativeQuestionComponent implements OnInit {
    @Input() formElement: FormQuestion;
    @Input() numSubQuestions: number;
    @Input() parentValue: any;
    @Input() index: any;

    FormService = FormService;
    hasTime: boolean;
    static readonly reHasTime = /[hHmsSkaAZ]/;
    previousUom: string;

    ngOnInit() {
        this.hasTime = this.formElement.question.datatypeDate
            ? !!NativeQuestionComponent.reHasTime.exec(this.formElement.question.datatypeDate.format) : false;
        this.previousUom = this.formElement.question.answerUom;
    }

    constructor(public nrs: NativeRenderService) {}

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

        if (this.isFirstInRow(pvIndex !== undefined ? pvIndex : index))
            result += ' clear';
        return result;
    }

    convert() {
        if (this.previousUom && this.formElement.question.answer) {
            let value: number;
            if (typeof(this.formElement.question.answer) === 'string')
                value = parseInt(this.formElement.question.answer);
            else
                value = this.formElement.question.answer;

            if (value && typeof(value) === 'number' && !isNaN(value)) {
                let result = ucum.convert(value, this.previousUom, this.formElement.question.answerUom);
                if (result && !isNaN(result))
                    this.formElement.question.answer = result;
            }
        }
        this.previousUom = this.formElement.question.answerUom;
    }

    isFirstInRow(index) {
        if (this.nrs.profile && this.nrs.profile.numberOfColumns > 0)
            return index % this.nrs.profile.numberOfColumns === 0;
        else
            return index % 4 === 0;
    }

    hasLabel(question) {
        return question.label && !question.hideLabel;
    }

    isOneLiner(question, numSubQuestions) {
        return numSubQuestions && !this.hasLabel(question) && !question.instructions
            && question.elementType === 'question' && question.question.datatype !== 'Value List';
    }

    updateDateTime() {
        let d = this.formElement.question.answerDate;
        let t = this.formElement.question.answerTime;
        if (!d)
            return this.formElement.question.answer = '';
        if (!t)
            t = {hour: 0, minute: 0, second: 0};

        let m = moment([d.year, d.month - 1, d.day, t.hour, t.minute,  t.second]);
        if (m.isValid()) {
            if (this.formElement.question.datatypeDate && this.formElement.question.datatypeDate.format)
                this.formElement.question.answer = m.format(this.formElement.question.datatypeDate.format);
            else
                this.formElement.question.answer = m.format('YYYY-MM-DDTHH:mm:ssZ');
        } else {
            this.formElement.question.answer = '';
        }
    }
}
