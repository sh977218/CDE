import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';

export class Token {
    formElement;
    selectedQuestion;
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
    skipLogicForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                protected dialog: MatDialog,
                public dialogRef: MatDialogRef<SkipLogicComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
        this.labelOptions = data.priorQuestions.map(q => {
            let realLabel = q.label;
            if (!realLabel) realLabel = q.question.cde.name;
            return realLabel;
        });

        let items = this.formBuilder.array([]);

        let tokens = this.getTokens(data.formElement.skipLogic.condition);
        tokens.forEach(token => {
            if (token.label) {
                let question = this.getQuestionByLabel(token.label);
                token.selectedQuestion = question;
                if (!question) token.error = "Can not find question.";
                else token.error = '';
            }
            items.push(this.formBuilder.group(token));
        });

        this.skipLogicForm = this.formBuilder.group({items});
        const itemsControl = this.skipLogicForm.get('items');
        this.skipLogicForm.valueChanges.subscribe(newValue => {
            if (newValue.items) {
                newValue.items.forEach(item => {
                    if (item.label) {
                        let q = this.getQuestionByLabel(item.label);
                        if (q) {
                            console.log('selected question: ' + q.label);
                            item.selectedQuestion = q;
                        } else {
                            console.log(item.label + '   not found.');
                        }
                    }
                });
                itemsControl.updateValueAndValidity();
            }
        });
    }

    addToken(): void {
        let items = this.skipLogicForm.get('items') as FormArray;
        items.push(this.formBuilder.group(new Token()));
    }

    deleteAllSkipLogic() {
        this.skipLogicForm = this.formBuilder.group({items: this.formBuilder.array([])});
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

    saveSkipLogic() {
        let value = this.skipLogicForm.getRawValue();
        this.dialogRef.close(value.items);
    }

}