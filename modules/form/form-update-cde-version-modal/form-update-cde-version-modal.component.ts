import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataElementService } from 'cde/dataElement.service';
import { convertCdeToQuestion } from 'nativeRender/form.service';
import { FormQuestion, QuestionValueList } from 'shared/form/form.model';
import { DataElement } from 'shared/de/dataElement.model';
import { isEqual, toString } from 'lodash';

@Component({
    selector: 'cde-form-update-cde-version-modal',
    templateUrl: './form-update-cde-version-modal.component.html'
})
export class FormUpdateCdeVersionModalComponent {
    updateCdeVersion: any = {
        currentQuestion: {},
        newQuestion: {}
    };

    constructor(@Inject(MAT_DIALOG_DATA) public question) {
        this.fetchQuestion(question);
    }

    fetchQuestion(question) {
        DataElementService.fetchDe(question.question.cde.tinyId).then(newCde => {
            const oldVersion = question.question.cde.version ? question.question.cde.version : '';
            DataElementService.fetchDe(question.question.cde.tinyId, oldVersion).then(oldCde => {
                convertCdeToQuestion(newCde, newQuestion => {
                    if (newQuestion) {
                        this.doMerge(newQuestion, question, newCde, oldCde);
                        this.updateCdeVersion.currentQuestion = question;
                        this.updateCdeVersion.newQuestion = newQuestion;
                    }
                });
            });
        });
    }

    doMerge(newQuestion: FormQuestion, currentQuestion: FormQuestion, newCde: DataElement, oldCde: DataElement) {
        newQuestion.instructions = currentQuestion.instructions;
        newQuestion.question.editable = currentQuestion.question.editable;
        newQuestion.question.invisible = currentQuestion.question.invisible;
        if (currentQuestion.question.datatype === 'Value List') {
            (newQuestion.question as QuestionValueList).displayAs = currentQuestion.question.displayAs;
            (newQuestion.question as QuestionValueList).multiselect = currentQuestion.question.multiselect;
        }
        newQuestion.question.required = currentQuestion.question.required;
        newQuestion.question.unitsOfMeasure =
            newQuestion.question.unitsOfMeasure.length && currentQuestion.question.unitsOfMeasure
                .filter(u => newQuestion.question.unitsOfMeasure[0].code === u.code && !u.system).length
                ? currentQuestion.question.unitsOfMeasure
                : newQuestion.question.unitsOfMeasure.concat(currentQuestion.question.unitsOfMeasure);
        newQuestion.repeat = currentQuestion.repeat;
        newQuestion.skipLogic = currentQuestion.skipLogic;
        if (newCde.designations.some(n => n.designation === currentQuestion.label)) {
            newQuestion.label = currentQuestion.label;
        }

        this.updateCdeVersion.bCde = true;
        this.updateCdeVersion.bLabel = !isEqual(newCde.designations, oldCde.designations);
        this.updateCdeVersion.bDatatype = currentQuestion.question.datatype !== newQuestion.question.datatype;
        this.updateCdeVersion.bDefault = toString(currentQuestion.question.defaultAnswer) !== toString(newQuestion.question.defaultAnswer);
        this.updateCdeVersion.bUom = !isEqual(currentQuestion.question.unitsOfMeasure, newQuestion.question.unitsOfMeasure);

        switch (newQuestion.question.datatype) {
            case 'Value List':
                if (currentQuestion.question.datatype === 'Value List') {
                    this.updateCdeVersion.bValuelist = !isEqual(currentQuestion.question.cde.permissibleValues,
                        newQuestion.question.cde.permissibleValues);
                    if (!this.updateCdeVersion.bValuelist) {
                        newQuestion.question.answers = currentQuestion.question.answers;
                    }

                    if (currentQuestion.question.defaultAnswer && newQuestion.question.answers.filter(
                        a => a.permissibleValue === currentQuestion.question.defaultAnswer).length > 0) {
                        newQuestion.question.defaultAnswer = currentQuestion.question.defaultAnswer;
                    }
                } else {
                    this.updateCdeVersion.bValuelist = true;
                }
                break;
            case 'Date':
                if (currentQuestion.question.datatype === 'Date' && currentQuestion.question.datatypeDate) {
                    if (!newQuestion.question.datatypeDate) {
                        newQuestion.question.datatypeDate = {};
                    }
                    newQuestion.question.datatypeDate.precision = currentQuestion.question.datatypeDate.precision;
                }
                break;
            case 'Number':
                if (currentQuestion.question.datatype === 'Number' &&
                    currentQuestion.question.datatypeNumber && newQuestion.question.datatypeNumber) {
                    this.updateCdeVersion.bNumberMin = currentQuestion.question.datatypeNumber.minValue
                        !== newQuestion.question.datatypeNumber.minValue;
                    this.updateCdeVersion.bNumberMax = currentQuestion.question.datatypeNumber.maxValue
                        !== newQuestion.question.datatypeNumber.maxValue;
                } else {
                    this.updateCdeVersion.bNumberMin = this.updateCdeVersion.bNumberMax = true;
                }
                break;
        }

        this.updateCdeVersion = this.updateCdeVersion;

    }

}
