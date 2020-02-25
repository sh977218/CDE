import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';
import { FormElement, FormQuestion } from 'shared/form/form.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

export class Token {
    answer: string = '';
    error?: string;
    label: string = '';
    logic?: string = 'AND';
    operator: string = '=';
    selectedQuestion?: FormQuestion = new FormQuestion();
}

@Component({
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent {
    logicOptions = ['AND', 'OR'];
    labelOptions: string[] = [];
    operatorOptions = ['=', '>', '<', '>=', '<='];
    skipLogicForm: FormGroup = this.formBuilder.group({
        items: this.formBuilder.array([])
    });

    constructor(private cdr: ChangeDetectorRef,
                private formBuilder: FormBuilder,
                protected dialog: MatDialog,
                public dialogRef: MatDialogRef<SkipLogicComponent>,
                @Inject(MAT_DIALOG_DATA) public data: {formElement: FormElement, priorQuestions: FormQuestion[]}) {
        this.labelOptions = data.priorQuestions.map(q => q.label || q.question.cde.name || '');

        const tokens = this.getTokens(data.formElement.skipLogic && data.formElement.skipLogic.condition);
        tokens.forEach(token => {
            if (token.label) {
                const question = this.getQuestionByLabel(token.label);
                token.selectedQuestion = question;
                if (!question) {
                    token.error = "Can't find question.";
                } else {
                    token.error = '';
                }
            }
            this.items.push(this.createItem(token));
        });
        this.labelOnChange();

    }

    labelOnChange() {
        for (const item of this.items.controls) {
            const labelControl = item.get('label');
            const selectedQuestionControl = item.get('selectedQuestion');
            if (labelControl && selectedQuestionControl) {
                labelControl.valueChanges.subscribe(newLabel => {
                    const q = this.getQuestionByLabel(newLabel);
                    if (q) {
                        selectedQuestionControl.setValue(q);
                    }
                    this.cdr.detectChanges();
                });
            }
        }
    }

    get items(): FormArray {
        return this.skipLogicForm.get('items') as FormArray;
    }

    createItem(token = new Token()) {
        return this.formBuilder.group(token);
    }

    addToken() {
        const newToken = this.createItem();
        this.items.push(newToken);
        this.labelOnChange();
        this.cdr.detectChanges();
    }

    private getQuestionByLabel(label: string) {
        const temp = this.data.priorQuestions.filter((q: FormQuestion) =>  (q.label ? q.label : q.question.cde.name) === label);
        return temp.length === 1 ? temp[0] : undefined;
    }

    private getTokens(sl?: string): Token[] {
        if (!sl || sl.trim().length === 0) {
            return [];
        }

        let str = sl;
        const token: Token = new Token();
        const labelMatch = str.match(/^"[^"]+"/);
        if (labelMatch && labelMatch.length > 0) {
            token.label = labelMatch[0].replace(/"/g, '');
            str = str.substring(labelMatch[0].length).trim();
        }

        const operatorMatch = str.match(/^(>=|<=|=|>|<|!=)/);
        if (operatorMatch && operatorMatch.length > 0) {
            token.operator = operatorMatch[0];
            str = str.substring(operatorMatch[0].length).trim();
        }

        const answerMatch = str.match(/(^"[^"]+")|(^[^"]+)|("")/);
        if (answerMatch && answerMatch.length > 0) {
            token.answer = answerMatch[0].replace(/"/g, '');
            str = str.substr(answerMatch[0].length).trim();
        }

        const logicMatch = str.match(/^((\bAND\b)|(\bOR\b))/i);
        if (logicMatch && logicMatch.length > 0) {
            token.logic = logicMatch[0];
            str = str.substr(logicMatch[0].length).trim();
        }

        const otherTokens = this.getTokens(str);

        return [token].concat(otherTokens);
    }
}
