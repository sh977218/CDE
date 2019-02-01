import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export class Token {
    formElement;
    question;
    label: string = '';
    operator: string = '=';
    answer: string = '';
    logic?: string = 'AND';
}

@Component({
    selector: 'cde-skip-logic-autocomplete',
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent implements OnInit {
    @Input() formElement;
    @Input() parent;
    @Input() canEdit;
    @Output() onSaved = new EventEmitter();

    editMode: boolean = false;
    tokens: Token[] = [];

    ngOnInit() {
        this.tokens = this.getTokens(this.formElement.skipLogic.condition);
        this.tokens.forEach(token => {
            if (token.label) {
                let question = this.getQuestionByLabel(this.parent, token.label);
                token.question = question;
            }
        });
    }

    addToken() {
        this.tokens.push(new Token);
    }

    saveSkipLogic() {
        this.editMode = false;
        let skipLogic = '';
        this.tokens.forEach((t, i) => {
            if (t.label && t.operator && t.answer) {
                skipLogic += '"' + t.label + '"' + t.operator + '"' + t.answer + '"';
                if (i < this.tokens.length - 1) skipLogic += t.logic;
            }
        });
        this.formElement.skipLogic.condition = skipLogic;
        this.onSaved.emit();
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


}