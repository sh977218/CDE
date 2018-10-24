import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CodeAndSystem } from 'shared/models.model';
import { questionMulti } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
import { ScoreService } from 'nativeRender/score.service';
import { AlertService } from 'alert/alert.service';

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

    questionMulti = questionMulti;

    ngOnInit() {
        this.previousUom = this.formElement.question.answerUom;
    }

    constructor(private http: HttpClient,
                public scoreSvc: ScoreService,
                private alert: AlertService,
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
                this.convertUnits(value, this.previousUom, this.formElement.question.answerUom, (error, result) => {
                    if (!error && result !== undefined && !isNaN(result) && unit === this.formElement.question.answerUom) {
                        this.formElement.question.answer = result;
                        this.scoreSvc.triggerCalculateScore(this.formElement);
                    }
                });
            }
        }
        this.previousUom = this.formElement.question.answerUom;
    }

    // cb(error, number)
    convertUnits(value: number, fromUnit: CodeAndSystem, toUnit: CodeAndSystem, cb) {
        if (fromUnit.system === 'UCUM' && toUnit.system === 'UCUM') {
            this.http.get('/ucumConvert?value=' + value + '&from=' + encodeURIComponent(fromUnit.code) + '&to='
                + encodeURIComponent(toUnit.code)).subscribe(v => cb(undefined, v), e => cb(e));
        } else {
            cb(undefined, value); // no conversion for other systems
        }
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

    locationDenied = false;

    getCurrentGeoLocation(formElement) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    if (formElement) formElement.question.answer = position.coords;
                },
                err => {
                    this.locationDeniedMessage();
                    this.locationDenied = err.code === err.PERMISSION_DENIED ? true : false
                });
        }
    }
    locationDeniedMessage () {
        this.alert.addAlert("info", "Please enable location for this site.");
    }

}
