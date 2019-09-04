import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { isScore, questionMulti } from 'shared/form/fe';
import { FormQuestion, FormQuestionFollow } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-question',
    templateUrl: './nativeQuestion.component.html',
})
export class NativeQuestionComponent implements OnInit {
    @Input() formElement!: FormQuestionFollow;
    @Input() numSubQuestions!: number;
    @Input() parentValue!: string;
    datePrecisionToType = FormQuestion.datePrecisionToType;
    datePrecisionToStep = FormQuestion.datePrecisionToStep;
    isScore = isScore;
    metadataTagsNew?: string;
    questionMulti = questionMulti;
    vsacControl = new FormControl();
    vsacCodes: {code: string, displayname: string}[] = [];
    NRS = NativeRenderService;

    constructor(public nrs: NativeRenderService) {
    }

    ngOnInit() {
        if (this.formElement.question.datatype === 'Dynamic Code List') {
            const q = this.formElement.question;
            this.loadVsacCode((q.datatypeDynamicCodeList.code || ''), '');
            this.vsacControl.valueChanges
                .pipe(
                    debounceTime(400),
                    distinctUntilChanged()
                )
                .subscribe(value => {
                    this.loadVsacCode((q.datatypeDynamicCodeList.code || ''), value);
                });
        }
        this.formElement.question.previousUom = this.formElement.question.answerUom;
    }

    loadVsacCode(code = '', term = '') {
        fetch('/server/uts/searchValueSet/' + code + '?term=' + term)
            .then(response => response.json())
            .then(data => {
                this.vsacCodes = data.rows;
            })
            .catch(error => console.error(error));
    }

    classColumns(pvIndex: number, index: number) {
        let result = '';

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

        if (this.isFirstInRow(pvIndex !== undefined ? pvIndex : index)) { result += ' clear'; }
        return result;
    }

    hasHeading(q: FormQuestion): boolean {
        return this.hasLabel(q) || !!q.instructions && !!q.instructions.value;
    }

    hasLabel(q: FormQuestion): boolean {
        return !!q.label;
    }

    isFirstInRow(index: number): boolean {
        if (this.nrs.profile && this.nrs.profile.numberOfColumns > 0) {
            return index % this.nrs.profile.numberOfColumns === 0;
        } else {
            return index % 4 === 0;
        }
    }

    isOneLiner(q: FormQuestion, numSubQuestions: number): boolean {
        return !!numSubQuestions && !this.hasHeading(q) && (!q.instructions || !q.instructions.value)
            && q.elementType === 'question' && q.question.datatype !== 'Value List';
    }

    typeof(value: any) {
        return typeof value;
    }
}
