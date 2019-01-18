import { Component, Input, OnInit } from '@angular/core';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { ScoreService } from 'nativeRender/score.service';
import { CbErr, CodeAndSystem } from 'shared/models.model';
import { questionMulti } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
import { callbackify } from 'core/browser';

@Component({
    selector: 'cde-native-question',
    templateUrl: './nativeQuestion.component.html',
})
export class NativeQuestionComponent implements OnInit {
    @Input() formElement!: FormQuestion;
    @Input() numSubQuestions!: number;
    @Input() parentValue!: string;
    NRS = NativeRenderService;
    datePrecisionToType = FormQuestion.datePrecisionToType;
    datePrecisionToStep = FormQuestion.datePrecisionToStep;
    locationDenied = false;
    metadataTagsNew?: string;
    previousUom?: CodeAndSystem;

    questionMulti = questionMulti;

    ngOnInit() {
        this.previousUom = this.formElement.question.answerUom;
    }

    constructor(public nrs: NativeRenderService,
                public scoreSvc: ScoreService) {
    }

    classColumns(pvIndex: number, index: number) {
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
        let unit = this.formElement.question.answerUom;
        if (this.previousUom && unit && this.formElement.question.answer != null) {
            let value: number;
            if (typeof(this.formElement.question.answer) === 'string') value = parseFloat(this.formElement.question.answer);
            else value = this.formElement.question.answer;

            if (typeof(value) === 'number' && !isNaN(value)) {
                NativeQuestionComponent.convertUnits(value, this.previousUom, unit, (error?: string, result?: number) => {
                    if (!error && result !== undefined && !isNaN(result) && unit === this.formElement.question.answerUom) {
                        this.formElement.question.answer = result;
                        this.scoreSvc.triggerCalculateScore(this.formElement);
                    }
                });
            }
        }
        this.previousUom = this.formElement.question.answerUom;
    }

    static convertUnits(value: number, fromUnit: CodeAndSystem, toUnit: CodeAndSystem, cb: CbErr<number>) {
        if (fromUnit.system === 'UCUM' && toUnit.system === 'UCUM') {
            callbackify(
                FormService.convertUnits(value, encodeURIComponent(fromUnit.code), encodeURIComponent(toUnit.code))
            )(cb);
        } else {
            cb(undefined, value); // no conversion for other systems
        }
    }

    getCurrentGeoLocation(formElement: FormQuestion) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.locationDenied = false;
                    if (formElement) formElement.question.answer = position.coords;
                },
                err => {
                    this.locationDenied = err.code === err.PERMISSION_DENIED;
                }
            );
        }
    }

    hasHeading(q: FormQuestion): boolean {
        return this.hasLabel(q) || !!q.instructions && !!q.instructions.value;
    }

    hasLabel(q: FormQuestion): boolean {
        return !!q.label && !q.hideLabel;
    }

    isFirstInRow(index: number): boolean {
        if (this.nrs.profile && this.nrs.profile.numberOfColumns > 0) return index % this.nrs.profile.numberOfColumns === 0;
        else return index % 4 === 0;
    }

    isOneLiner(q: FormQuestion, numSubQuestions: number): boolean {
        return !!numSubQuestions && !this.hasHeading(q) && (!q.instructions || !q.instructions.value)
            && q.elementType === 'question' && q.question.datatype !== 'Value List';
    }
}
