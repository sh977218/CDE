import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';

export class Token {
    formElement;
    selectedQuestion;
    label: string = '';
    operator: string = '=';
    answer: string = '';
    logic?: string = 'AND';
    error?: string = '';
}

@Component({
    selector: 'cde-skip-logic-autocomplete',
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent {
    tokens: Token[] = [];

    constructor(protected dialog: MatDialog,
                public dialogRef: MatDialogRef<SkipLogicComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
        this.tokens = this.getTokens(data.formElement.skipLogic.condition);
        this.tokens.forEach(token => {
            if (token.label) {
                let question = this.getQuestionByLabel(data.parent, token.label);
                token.selectedQuestion = question;
                if (!question) token.error = "Can not find question.";
                else token.error = '';
            }
        });
    }

    addToken() {
        this.tokens.push(new Token);
    }

    deleteSkipLogic() {
        this.tokens = [];
    }

    deleteToken(i) {
        this.tokens.splice(i, 1);
    }

    private getQuestionByLabel(formElement, label) {
        for (let e of formElement.formElements) {
            let elementType = e.elementType;
            if (elementType === 'question' && e.label === label) return e;
            else this.getQuestionByLabel(e, label);
        }
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

    onNoClick() {
        this.dialogRef.close();
    }

    hasError() {
        this.tokens.filter(t => t.error).length > 0;
    }
}