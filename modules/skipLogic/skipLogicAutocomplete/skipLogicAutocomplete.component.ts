import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';
import { FormQuestion } from 'shared/form/form.model';

export class Token {
    formElement;
    selectedQuestion: FormQuestion = new FormQuestion();
    label: string = '';
    operator: string = '=';
    answer: string = '';
    logic?: string = 'AND';
}

@Component({
    selector: 'cde-skip-logic-autocomplete',
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent {
    logicOptions = ['AND', 'OR'];
    labelOptions = [];
    operatorOptions = ['=', '>', '<', '>=', '<='];
    skipLogicForm: FormGroup = this.formBuilder.group({
        items: this.formBuilder.array([])
    });

    constructor(private formBuilder: FormBuilder,
                protected dialog: MatDialog,
                public dialogRef: MatDialogRef<SkipLogicComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
        this.labelOptions = data.priorQuestions.map(q => {
            let realLabel = q.label;
            if (!realLabel) realLabel = q.question.cde.name;
            return realLabel;
        });

        let tokens = this.getTokens(data.formElement.skipLogic.condition);
        tokens.forEach(token => {
            if (token.label) {
                let question = this.getQuestionByLabel(token.label);
                token.selectedQuestion = question;
                if (!question) token.error = "Can't find question.";
                else token.error = '';
            }
            this.items.push(this.createItem(token));
        });

        for (let item of this.items.controls) {
            this.labelOnChange(item);
        }
    }

    labelOnChange(control) {
        control.valueChanges.subscribe(newToken => {
            if (newToken.label) {
                let q = this.getQuestionByLabel(newToken.label);
                if (q) {
                    newToken.selectedQuestion = q;
                }
            }
        });
    }

    get items(): FormArray {
        return this.skipLogicForm.get('items') as FormArray;
    }

    createItem(token = new Token()) {
        return this.formBuilder.group(token);
    }

    addToken() {
        let newToken = this.createItem();
        this.labelOnChange(newToken);
        this.items.push(newToken);
    }

    private getQuestionByLabel(label) {
        let temp = this.data.priorQuestions.filter(q => {
            let realLabel = q.label ? q.label : q.question.cde.name;
            return realLabel === label;
        });
        if (temp.length === 1) return temp[0];
        else return null;
    }

    private getTokens(sl) {
        if (!sl || sl.trim().length === 0) return [];

        let str = sl;
        let token: Token = new Token();
        let labelMatch = str.match(/^"[^"]+"/);
        if (labelMatch && labelMatch.length > 0) {
            token.label = labelMatch[0].replace(/\"/g, '');
            str = str.substring(labelMatch[0].length).trim();
        }

        let operatorMatch = str.match(/^(>=|<=|=|>|<|!=)/);
        if (operatorMatch && operatorMatch.length > 0) {
            token.operator = operatorMatch[0];
            str = str.substring(operatorMatch[0].length).trim();
        }

        let answerMatch = str.match(/(^"[^"]+")|(^[^"]+)|("")/);
        if (answerMatch && answerMatch.length > 0) {
            token.answer = answerMatch[0].replace(/\"/g, '');
            str = str.substr(answerMatch[0].length).trim();
        }

        let logicMatch = str.match(/^((\bAND\b)|(\bOR\b))/i);
        if (logicMatch && logicMatch.length > 0) {
            token.logic = logicMatch[0];
            str = str.substr(logicMatch[0].length).trim();
        }

        let otherTokens = this.getTokens(str);

        return [token].concat(otherTokens);
    }

}